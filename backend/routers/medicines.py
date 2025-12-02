from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import pandas as pd
import os
import uuid
from pathlib import Path

# Importaciones del proyecto
from backend.core.dependencies import get_db
from backend.core import models, schemas
from backend.core.crud import crud_medicines
from backend.core.schemas import (
    ExcelImportPreviewResponse,
    ExcelImportItem,
    ExcelImportResult,
    ExcelImportConfirmItem
)
from backend.utils.pricing_formula import (
    calculate_sale_price,
    get_price_range,
    calculate_price_difference
)

router = APIRouter(
    prefix="/medicines",
    tags=["medicines"],
    responses={404: {"description": "Not found"}},
)

# Directorio para almacenar imágenes
IMAGES_DIR = Path("uploads/medicine_images")
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# Extensiones de imagen permitidas
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}


# ============================================================================
# ENDPOINTS DE IMÁGENES
# ============================================================================

@router.post("/{medicine_id}/upload-image")
async def upload_medicine_image(
    medicine_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Sube una imagen para un medicamento.
    Formatos aceptados: JPG, JPEG, PNG, GIF, WEBP
    """
    # Verificar que el medicamento existe
    db_medicine = crud_medicines.get_medicine(db, medicine_id=medicine_id)
    if db_medicine is None:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado")
    
    # Validar extensión del archivo
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Formato no permitido. Use: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Generar nombre único para el archivo
    unique_filename = f"{medicine_id}_{uuid.uuid4().hex}{file_ext}"
    file_path = IMAGES_DIR / unique_filename
    
    # Eliminar imagen anterior si existe
    if db_medicine.image_path:
        old_path = Path(db_medicine.image_path)
        if old_path.exists():
            old_path.unlink()
    
    # Guardar el archivo
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar imagen: {str(e)}")
    
    # Actualizar la ruta en la base de datos
    db_medicine.image_path = str(file_path)
    db.commit()
    
    return {
        "message": "Imagen subida correctamente",
        "image_path": str(file_path),
        "medicine_id": medicine_id
    }


@router.get("/images/{filename}")
async def get_medicine_image(filename: str):
    """Obtiene una imagen de medicamento por nombre de archivo"""
    file_path = IMAGES_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    
    return FileResponse(file_path)


@router.delete("/{medicine_id}/image")
async def delete_medicine_image(medicine_id: int, db: Session = Depends(get_db)):
    """Elimina la imagen de un medicamento"""
    db_medicine = crud_medicines.get_medicine(db, medicine_id=medicine_id)
    if db_medicine is None:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado")
    
    if not db_medicine.image_path:
        raise HTTPException(status_code=404, detail="El medicamento no tiene imagen")
    
    # Eliminar archivo
    try:
        file_path = Path(db_medicine.image_path)
        if file_path.exists():
            file_path.unlink()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar imagen: {str(e)}")
    
    # Limpiar referencia en base de datos
    db_medicine.image_path = None
    db.commit()
    
    return {"message": "Imagen eliminada correctamente"}


# ============================================================================
# ENDPOINTS DE BÚSQUEDA (deben ir antes de los endpoints con parámetros de ruta)
# ============================================================================

@router.get("/search/barcode/", response_model=List[schemas.Medicine])
def search_medicines_by_barcode(
    barcode: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    """
    Buscar medicamentos por código de barras (búsqueda exacta o parcial)
    """
    if len(barcode) < 3:
        # Búsqueda exacta para códigos cortos
        medicine = crud_medicines.get_medicine_by_barcode(db, barcode=barcode)
        return [medicine] if medicine else []
    else:
        # Búsqueda parcial para códigos largos
        return crud_medicines.search_medicines_by_barcode(db, barcode=barcode)


@router.get("/search/", response_model=List[schemas.Medicine])
def search_medicines(
    query: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    """
    Buscar medicamentos por nombre, código de barras o sustancia activa
    """
    return crud_medicines.search_medicines(db, query=query)


# ============================================================================
# ENDPOINTS DE IMPORTACIÓN EXCEL
# ============================================================================

@router.post("/import-excel/preview", response_model=ExcelImportPreviewResponse)
async def preview_excel_import(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Previsualiza la importación del Excel antes de confirmar.
    Muestra diferencias de precios y productos nuevos/existentes.
    
    Columnas esperadas del Excel:
    - CODIGO DE BARRAS: Código de barras del producto
    - DESCRIPCION: Nombre del medicamento
    - SUSTANCIA ACTIVA: Ingrediente activo (opcional)
    - LABORATORIO: Fabricante (opcional)
    - IVA: "IVA" o "s/IVA" para indicar si lleva IVA
    - INV: Cantidad en inventario
    - DELTA: Precio de compra
    """
    try:
        # Validar extensión del archivo
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(
                status_code=400,
                detail="Solo se aceptan archivos Excel (.xlsx, .xls)"
            )

        # Leer el Excel usando pandas
        df = pd.read_excel(file.file)

        # Validar columnas requeridas
        required_columns = ['CODIGO DE BARRAS', 'DESCRIPCION', 'DELTA']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Columnas requeridas faltantes: {', '.join(missing_columns)}"
            )

        preview_items = []
        new_medicines = 0
        existing_medicines = 0
        price_changes = 0

        # Procesar cada fila
        for idx, row in df.iterrows():
            try:
                # Extraer datos del Excel
                barcode = str(row.get("CODIGO DE BARRAS", "")).strip()
                if not barcode:
                    continue  # Saltar filas sin código de barras

                name = str(row.get("DESCRIPCION", "")).strip()
                if not name:
                    continue  # Saltar filas sin nombre

                active_substance = str(row.get("SUSTANCIA ACTIVA", "")).strip() if pd.notna(row.get("SUSTANCIA ACTIVA")) else None
                laboratory = str(row.get("LABORATORIO", "")).strip() if pd.notna(row.get("LABORATORIO")) else None

                # Convertir precio de compra (Delta)
                delta_value = row.get("DELTA", 0)
                if isinstance(delta_value, str):
                    delta_str = delta_value.replace("$", "").replace(",", "").strip()
                    purchase_price_new = float(delta_str) if delta_str else 0.0
                else:
                    purchase_price_new = float(delta_value) if pd.notna(delta_value) else 0.0

                # Determinar IVA
                iva_text = str(row.get("IVA", "")).upper().strip()
                iva_rate = 0.16 if iva_text == "IVA" else 0.0

                # Obtener inventario
                inv_value = row.get("INV", 0)
                inventory_to_add = int(inv_value) if pd.notna(inv_value) else 0

                # Buscar si existe el medicamento por código de barras
                existing_medicine = db.query(models.Medicine).filter(
                    models.Medicine.barcode == barcode
                ).first()

                # Calcular precio sugerido
                suggested_price = calculate_sale_price(purchase_price_new)
                price_range_desc = get_price_range(purchase_price_new)

                # Comparar precios si existe
                price_change = "new"
                price_difference = None

                if existing_medicine:
                    existing_medicines += 1
                    price_difference = calculate_price_difference(
                        existing_medicine.purchase_price or 0,
                        purchase_price_new
                    )
                    price_change = price_difference["direction"]

                    if price_change in ["up", "down"]:
                        price_changes += 1
                else:
                    new_medicines += 1

                preview_items.append(ExcelImportItem(
                    barcode=barcode,
                    name=name,
                    active_substance=active_substance,
                    laboratory=laboratory,
                    purchase_price_new=purchase_price_new,
                    purchase_price_old=existing_medicine.purchase_price if existing_medicine else None,
                    sale_price_suggested=suggested_price,
                    sale_price_current=existing_medicine.sale_price if existing_medicine else None,
                    price_change=price_change,
                    iva_rate=iva_rate,
                    inventory_to_add=inventory_to_add,
                    exists=existing_medicine is not None,
                    medicine_id=existing_medicine.id if existing_medicine else None,
                    price_range=price_range_desc,
                    price_difference=price_difference
                ))

            except Exception as e:
                # Log error pero continuar con la siguiente fila
                print(f"Error procesando fila {idx}: {str(e)}")
                continue

        return ExcelImportPreviewResponse(
            items=preview_items,
            total_items=len(preview_items),
            new_medicines=new_medicines,
            existing_medicines=existing_medicines,
            price_changes=price_changes
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error al procesar el archivo Excel: {str(e)}"
        )


@router.post("/import-excel/confirm", response_model=ExcelImportResult)
async def confirm_excel_import(
    items: List[ExcelImportConfirmItem],
    db: Session = Depends(get_db)
):
    """
    Confirma la importación con los precios ajustados por el usuario.
    - Si el medicamento existe: actualiza stock y precios
    - Si no existe: crea nuevo medicamento con inventario
    """
    results = {"created": 0, "updated": 0, "errors": []}

    for item in items:
        try:
            if item.exists and item.medicine_id:
                # Actualizar medicamento existente
                existing_medicine = db.query(models.Medicine).filter(
                    models.Medicine.id == item.medicine_id
                ).first()

                if existing_medicine:
                    # Actualizar campos básicos
                    existing_medicine.name = item.name
                    existing_medicine.purchase_price = item.purchase_price
                    existing_medicine.sale_price = item.sale_price
                    existing_medicine.iva_rate = item.iva_rate

                    # Actualizar campos opcionales si se proporcionan
                    if item.active_substance:
                        existing_medicine.active_substance = item.active_substance
                    if item.laboratory:
                        existing_medicine.laboratory = item.laboratory
                    if item.sat_key:
                        existing_medicine.sat_key = item.sat_key

                    # Actualizar inventario (sumar cantidad)
                    if existing_medicine.inventory:
                        existing_medicine.inventory.quantity += item.inventory_to_add
                    else:
                        # Crear inventario si no existe
                        new_inventory = models.Inventory(
                            medicine_id=existing_medicine.id,
                            quantity=item.inventory_to_add
                        )
                        db.add(new_inventory)

                    results["updated"] += 1
                else:
                    results["errors"].append({
                        "barcode": item.barcode,
                        "error": f"Medicamento con ID {item.medicine_id} no encontrado"
                    })

            else:
                # Crear nuevo medicamento
                new_medicine = models.Medicine(
                    name=item.name,
                    barcode=item.barcode,
                    purchase_price=item.purchase_price,
                    sale_price=item.sale_price,
                    iva_rate=item.iva_rate,
                    laboratory=item.laboratory,
                    active_substance=item.active_substance,
                    sat_key=item.sat_key,
                    prescription_required=False
                )
                db.add(new_medicine)
                db.flush()  # Obtener el ID

                # Crear inventario
                inventory = models.Inventory(
                    medicine_id=new_medicine.id,
                    quantity=item.inventory_to_add
                )
                db.add(inventory)

                results["created"] += 1

        except Exception as e:
            results["errors"].append({
                "barcode": item.barcode,
                "error": str(e)
            })

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error al guardar cambios: {str(e)}"
        )

    return ExcelImportResult(
        created=results["created"],
        updated=results["updated"],
        errors=results["errors"],
        total_processed=len(items)
    )


# ============================================================================
# ENDPOINTS CRUD BÁSICOS
# ============================================================================

@router.get("/", response_model=List[schemas.Medicine])
def read_medicines(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Obtener lista de medicamentos con paginación"""
    medicines = crud_medicines.get_medicines(db, skip=skip, limit=limit)
    return medicines


@router.post("/", response_model=schemas.Medicine)
def create_medicine(
    medicine: schemas.MedicineCreate,
    db: Session = Depends(get_db)
):
    """Crear un nuevo medicamento"""
    # Verificar si ya existe un medicamento con el mismo código de barras
    if medicine.barcode:
        existing = crud_medicines.get_medicine_by_barcode(db, barcode=medicine.barcode)
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Ya existe un medicamento con el código de barras: {medicine.barcode}"
            )
    return crud_medicines.create_medicine(db=db, medicine=medicine)


@router.get("/{medicine_id}", response_model=schemas.Medicine)
def read_medicine(
    medicine_id: int,
    db: Session = Depends(get_db)
):
    """Obtener un medicamento por ID"""
    db_medicine = crud_medicines.get_medicine(db, medicine_id=medicine_id)
    if db_medicine is None:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado")
    return db_medicine


@router.put("/{medicine_id}", response_model=schemas.Medicine)
def update_medicine(
    medicine_id: int,
    medicine: schemas.MedicineUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un medicamento existente"""
    db_medicine = crud_medicines.get_medicine(db, medicine_id=medicine_id)
    if db_medicine is None:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado")

    # Verificar código de barras duplicado si se está actualizando
    if medicine.barcode and medicine.barcode != db_medicine.barcode:
        existing = crud_medicines.get_medicine_by_barcode(db, barcode=medicine.barcode)
        if existing and existing.id != medicine_id:
            raise HTTPException(
                status_code=400,
                detail=f"Ya existe un medicamento con el código de barras: {medicine.barcode}"
            )

    return crud_medicines.update_medicine(db=db, medicine_id=medicine_id, medicine=medicine)


@router.delete("/{medicine_id}", response_model=schemas.Medicine)
def delete_medicine(
    medicine_id: int,
    db: Session = Depends(get_db)
):
    """Eliminar un medicamento"""
    db_medicine = crud_medicines.get_medicine(db, medicine_id=medicine_id)
    if db_medicine is None:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado")
    return crud_medicines.delete_medicine(db=db, medicine_id=medicine_id)

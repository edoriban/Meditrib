from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import pandas as pd
import os

from datetime import datetime

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

import io


# ============================================================================
# ENDPOINTS DE EXPORTACIÓN
# ============================================================================

@router.get("/export/excel")
async def export_medicines_to_excel(
    db: Session = Depends(get_db)
):
    """
    Exporta la lista completa de medicamentos a Excel para compartir con clientes.
    
    Incluye:
    - Código de barras
    - Nombre del medicamento
    - Ingrediente activo
    - Laboratorio
    - Precio de venta
    - IVA
    
    NO incluye (para proteger información comercial):
    - Precio de compra
    - Ganancia/Margen
    - Cantidad en inventario
    """
    # Obtener todos los medicamentos
    medicines = db.query(models.Medicine).all()
    
    # Crear DataFrame con las columnas para clientes
    data = []
    for med in medicines:
        # Determinar texto de IVA
        iva_text = "16%" if med.iva_rate and med.iva_rate > 0 else "Exento"
        
        data.append({
            "CODIGO DE BARRAS": med.barcode or "",
            "NOMBRE": med.name,
            "INGREDIENTE ACTIVO": med.active_substance or "",
            "LABORATORIO": med.laboratory or "",
            "PRECIO": round(med.sale_price, 2) if med.sale_price else 0,
            "IVA": iva_text,
        })
    
    df = pd.DataFrame(data)
    
    # Crear archivo Excel en memoria
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Catálogo de Medicamentos')
        
        # Ajustar ancho de columnas
        worksheet = writer.sheets['Catálogo de Medicamentos']
        for idx, col in enumerate(df.columns):
            max_length = max(
                df[col].astype(str).map(len).max(),
                len(col)
            ) + 2
            # Limitar ancho máximo
            max_length = min(max_length, 50)
            worksheet.column_dimensions[chr(65 + idx)].width = max_length
    
    output.seek(0)
    
    # Generar nombre de archivo con fecha
    filename = f"Catalogo_Medicamentos_{datetime.now().strftime('%Y%m%d')}.xlsx"
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


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
    - P. PUBLICO / P.PUBLICO: Precio al público (opcional)
    """
    try:
        # Validar extensión del archivo
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(
                status_code=400,
                detail="Solo se aceptan archivos Excel (.xlsx, .xls)"
            )

        # Leer el Excel usando pandas
        contents = await file.read()
        import io
        
        print(f"[EXCEL IMPORT] Archivo recibido: {file.filename}, tamaño: {len(contents)} bytes")
        
        # Primero intentar leer normalmente
        df = pd.read_excel(io.BytesIO(contents))
        
        # Normalizar nombres de columnas
        df.columns = df.columns.str.strip().str.upper()
        
        print(f"[EXCEL IMPORT] Columnas encontradas: {df.columns.tolist()}")
        
        # Si la primera fila parece ser un encabezado extra (no contiene las columnas esperadas),
        # intentar buscar la fila correcta de encabezados
        expected_headers = ['CODIGO DE BARRAS', 'DESCRIPCION', 'DELTA', 'IVA', 'LABORATORIO', 'CLAVE']
        
        # Verificar si las columnas actuales contienen alguna de las esperadas
        has_expected_columns = any(col in df.columns for col in expected_headers)
        
        print(f"[EXCEL IMPORT] ¿Tiene columnas esperadas? {has_expected_columns}")
        
        if not has_expected_columns:
            # Buscar la fila que contiene los encabezados
            df_raw = pd.read_excel(io.BytesIO(contents), header=None)
            header_row = None
            
            for idx, row in df_raw.iterrows():
                row_values = [str(v).strip().upper() for v in row.values if pd.notna(v)]
                row_text = ' '.join(row_values)
                print(f"[EXCEL IMPORT] Fila {idx}: {row_text[:100]}...")
                # Buscar si esta fila contiene palabras clave de encabezado
                if any(keyword in row_text for keyword in ['CODIGO DE BARRAS', 'DESCRIPCION', 'DELTA', 'CLAVE']):
                    header_row = idx
                    print(f"[EXCEL IMPORT] Encontrada fila de encabezados en: {idx}")
                    break
            
            if header_row is not None:
                # Re-leer el Excel con la fila correcta como encabezado
                df = pd.read_excel(io.BytesIO(contents), header=header_row)
                df.columns = df.columns.str.strip().str.upper()
                print(f"[EXCEL IMPORT] Nuevas columnas: {df.columns.tolist()}")
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"No se encontraron las columnas esperadas. Columnas encontradas: {', '.join(df.columns.tolist())}"
                )
        
        # Mapeo flexible de columnas
        column_mappings = {
            'CODIGO DE BARRAS': ['CODIGO DE BARRAS', 'CODIGO_DE_BARRAS', 'CODIGODEBARRAS', 'BARCODE', 'CODIGO', 'COD_BARRAS'],
            'DESCRIPCION': ['DESCRIPCION', 'DESCRIPCIÓN', 'NOMBRE', 'NAME', 'PRODUCTO'],
            'DELTA': ['DELTA', 'PRECIO_COMPRA', 'PRECIO COMPRA', 'COSTO', 'PRECIO'],
            'IVA': ['IVA', 'IMPUESTO', 'TAX'],
            'INV': ['INV', 'INVENTARIO', 'STOCK', 'CANTIDAD', 'QTY'],
            'SUSTANCIA ACTIVA': ['SUSTANCIA ACTIVA', 'SUSTANCIA_ACTIVA', 'INGREDIENTE', 'ACTIVO'],
            'LABORATORIO': ['LABORATORIO', 'LAB', 'FABRICANTE', 'MARCA'],
            'P. PUBLICO': ['P. PUBLICO', 'P.PUBLICO', 'P_PUBLICO', 'PRECIO_PUBLICO', 'PRECIO PUBLICO', 'PPUBLICO', 'PRECIO_VENTA', 'PRECIO VENTA'],
            'CC': ['CC', 'CANTIDAD_CAJA', 'CANT'],
            'CLAVE': ['CLAVE', 'SKU', 'CODIGO_INTERNO'],
        }
        
        def find_column(target_col):
            """Busca una columna usando múltiples nombres posibles"""
            for possible_name in column_mappings.get(target_col, [target_col]):
                if possible_name in df.columns:
                    return possible_name
            return None
        
        # Encontrar columnas
        barcode_col = find_column('CODIGO DE BARRAS')
        desc_col = find_column('DESCRIPCION')
        delta_col = find_column('DELTA')
        iva_col = find_column('IVA')
        inv_col = find_column('INV')
        substance_col = find_column('SUSTANCIA ACTIVA')
        lab_col = find_column('LABORATORIO')
        public_price_col = find_column('P. PUBLICO')

        # Validar columnas requeridas
        missing_columns = []
        if not barcode_col:
            missing_columns.append('CODIGO DE BARRAS')
        if not desc_col:
            missing_columns.append('DESCRIPCION')
        if not delta_col:
            missing_columns.append('DELTA')
            
        if missing_columns:
            available_cols = ', '.join(df.columns.tolist())
            raise HTTPException(
                status_code=400,
                detail=f"Columnas requeridas faltantes: {', '.join(missing_columns)}. Columnas disponibles: {available_cols}"
            )

        preview_items = []
        new_medicines = 0
        existing_medicines = 0
        price_changes = 0

        # Procesar cada fila
        for idx, row in df.iterrows():
            try:
                # Extraer datos del Excel
                barcode = str(row.get(barcode_col, "")).strip()
                if not barcode or barcode == "nan":
                    continue  # Saltar filas sin código de barras

                name = str(row.get(desc_col, "")).strip()
                if not name or name == "nan":
                    continue  # Saltar filas sin nombre

                # Campos opcionales
                active_substance = None
                if substance_col and pd.notna(row.get(substance_col)):
                    active_substance = str(row.get(substance_col)).strip()
                    if active_substance == "nan":
                        active_substance = None
                
                laboratory = None
                if lab_col and pd.notna(row.get(lab_col)):
                    laboratory = str(row.get(lab_col)).strip()
                    if laboratory == "nan":
                        laboratory = None

                # Convertir precio de compra (Delta)
                delta_value = row.get(delta_col, 0)
                if isinstance(delta_value, str):
                    delta_str = delta_value.replace("$", "").replace(",", "").strip()
                    purchase_price_new = float(delta_str) if delta_str and delta_str != "nan" else 0.0
                else:
                    purchase_price_new = float(delta_value) if pd.notna(delta_value) else 0.0

                # Determinar IVA
                iva_rate = 0.0
                if iva_col:
                    iva_text = str(row.get(iva_col, "")).upper().strip()
                    if iva_text in ["IVA", "SI", "YES", "1", "TRUE", "16", "16%", "0.16"]:
                        iva_rate = 0.16

                # Obtener inventario
                inventory_to_add = 0
                if inv_col:
                    inv_value = row.get(inv_col, 0)
                    if pd.notna(inv_value):
                        try:
                            inventory_to_add = int(float(inv_value))
                        except (ValueError, TypeError):
                            inventory_to_add = 0

                # Buscar si existe el medicamento por código de barras
                existing_medicine = db.query(models.Medicine).filter(
                    models.Medicine.barcode == barcode
                ).first()

                # Calcular precio sugerido usando nuestra fórmula
                # Ignoramos el precio público del Excel ya que suele ser muy alto
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
        import traceback
        print(f"Error completo: {traceback.format_exc()}")
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
    Procesa cada item individualmente para evitar que un error afecte a otros.
    NOTA: No importa cantidades de inventario - solo crea/actualiza datos del medicamento.
    
    IDENTIFICADOR: El código de barras es el identificador único.
    - Si existe un medicamento con ese barcode: actualiza precios y datos
    - Si no existe: crea nuevo medicamento con inventario en 0
    """
    results = {"created": 0, "updated": 0, "errors": []}
    
    total_items = len(items)
    print(f"[EXCEL IMPORT] Iniciando importación de {total_items} items")
    
    # Procesar cada item individualmente para aislar errores
    for idx, item in enumerate(items):
        try:
            # SIEMPRE buscar por código de barras como identificador único
            existing_medicine = db.query(models.Medicine).filter(
                models.Medicine.barcode == item.barcode
            ).first()
            
            if existing_medicine:
                # Actualizar medicamento existente
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

                # Solo crear inventario si no existe (con cantidad 0)
                if not existing_medicine.inventory:
                    new_inventory = models.Inventory(
                        medicine_id=existing_medicine.id,
                        quantity=0
                    )
                    db.add(new_inventory)
                
                db.commit()
                results["updated"] += 1
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

                # Crear inventario con cantidad 0 (el usuario ajustará manualmente)
                inventory = models.Inventory(
                    medicine_id=new_medicine.id,
                    quantity=0
                )
                db.add(inventory)
                db.commit()
                results["created"] += 1
            
            # Log de progreso cada 100 items
            if (idx + 1) % 100 == 0:
                print(f"[EXCEL IMPORT] Progreso: {idx + 1}/{total_items} procesados")

        except Exception as e:
            db.rollback()  # Rollback solo este item
            results["errors"].append({
                "barcode": item.barcode,
                "name": item.name,
                "error": str(e)
            })

    print(f"[EXCEL IMPORT] Importación completada: {results['created']} creados, {results['updated']} actualizados, {len(results['errors'])} errores")
    
    return ExcelImportResult(
        created=results["created"],
        updated=results["updated"],
        errors=results["errors"],
        total_processed=len(items)
    )


# ============================================================================
# ENDPOINTS CRUD BÁSICOS
# ============================================================================

@router.get("/paginated", response_model=schemas.MedicinePaginatedResponse)
def read_medicines_paginated(
    page: int = 1,
    page_size: int = 50,
    search: str = None,
    stock_filter: str = "all",
    db: Session = Depends(get_db)
):
    """
    Obtener lista de medicamentos con paginación del lado del servidor.
    
    - page: Número de página (empezando en 1)
    - page_size: Cantidad de items por página (default 50)
    - search: Término de búsqueda (busca en nombre, código de barras, laboratorio, sustancia activa)
    - stock_filter: "all", "in-stock", "out-of-stock"
    """
    result = crud_medicines.get_medicines_paginated(
        db, 
        page=page, 
        page_size=page_size,
        search=search,
        stock_filter=stock_filter
    )
    return result


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

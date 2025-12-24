from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import pandas as pd
import os
import io
from datetime import datetime

# Importaciones del proyecto
from backend.core.dependencies import get_db, get_tenant_id
from backend.core import models, schemas
from backend.core.crud import crud_products
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
    prefix="/products",
    tags=["products"],
    responses={404: {"description": "Not found"}},
)


# ============================================================================
# ENDPOINTS DE EXPORTACIÓN
# ============================================================================

@router.get("/export/excel")
async def export_products_to_excel(
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    """
    Exporta la lista completa de medicamentos a Excel para compartir con clientes.
    """
    # Obtener todos los medicamentos del tenant
    products = db.query(models.Product).filter(models.Product.tenant_id == tenant_id).all()
    
    # Crear DataFrame con las columnas para clientes
    data = []
    for med in products:
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
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Catálogo de Medicamentos')
    
    output.seek(0)
    filename = f"Catalogo_Medicamentos_{datetime.now().strftime('%Y%m%d')}.xlsx"
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# ============================================================================
# ENDPOINTS DE BÚSQUEDA
# ============================================================================

@router.get("/search/barcode/", response_model=List[schemas.Product])
def search_products_by_barcode(
    barcode: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    """Buscar medicamentos por código de barras"""
    if len(barcode) < 3:
        product = crud_products.get_product_by_barcode(db, barcode=barcode, tenant_id=tenant_id)
        return [product] if product else []
    else:
        return crud_products.search_products_by_barcode(db, barcode=barcode, tenant_id=tenant_id)


@router.get("/search/", response_model=List[schemas.Product])
def search_products(
    query: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    """Buscar medicamentos por nombre, código de barras o sustancia activa"""
    return crud_products.search_products(db, query=query, tenant_id=tenant_id)


# ============================================================================
# ENDPOINTS DE IMPORTACIÓN EXCEL
# ============================================================================

@router.post("/import-excel/preview", response_model=ExcelImportPreviewResponse)
async def preview_excel_import(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    """Previsualiza la importación del Excel antes de confirmar."""
    try:
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(status_code=400, detail="Solo se aceptan archivos Excel")

        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        df.columns = df.columns.str.strip().str.upper()
        
        column_mappings = {
            'CODIGO DE BARRAS': ['CODIGO DE BARRAS', 'BARCODE', 'CODIGO'],
            'DESCRIPCION': ['DESCRIPCION', 'NOMBRE', 'PRODUCTO'],
            'DELTA': ['DELTA', 'COSTO', 'PRECIO'],
            'IVA': ['IVA', 'TAX'],
            'INV': ['INV', 'STOCK', 'CANTIDAD'],
            'LABORATORIO': ['LABORATORIO', 'LAB', 'FABRICANTE'],
        }
        
        def find_column(target_col):
            for possible in column_mappings.get(target_col, [target_col]):
                if possible in df.columns: return possible
            return None

        barcode_col = find_column('CODIGO DE BARRAS')
        desc_col = find_column('DESCRIPCION')
        delta_col = find_column('DELTA')

        if not barcode_col or not desc_col or not delta_col:
            raise HTTPException(status_code=400, detail="Faltan columnas requeridas en el Excel")

        preview_items = []
        new_count = 0
        existing_count = 0
        price_changes = 0

        for idx, row in df.iterrows():
            barcode = str(row.get(barcode_col, "")).strip()
            if not barcode or barcode == "nan": continue

            name = str(row.get(desc_col, "")).strip()
            purchase_price_new = float(str(row.get(delta_col, 0)).replace("$", "").replace(",", ""))

            existing_product = crud_products.get_product_by_barcode(db, barcode=barcode, tenant_id=tenant_id)

            suggested_price = calculate_sale_price(purchase_price_new)
            price_change = "new"
            price_diff = None

            if existing_product:
                existing_count += 1
                price_diff = calculate_price_difference(existing_product.purchase_price or 0, purchase_price_new)
                price_change = price_diff["direction"]
                if price_change in ["up", "down"]: price_changes += 1
            else:
                new_count += 1

            preview_items.append(ExcelImportItem(
                barcode=barcode,
                name=name,
                purchase_price_new=purchase_price_new,
                purchase_price_old=existing_product.purchase_price if existing_product else None,
                sale_price_suggested=suggested_price,
                sale_price_current=existing_product.sale_price if existing_product else None,
                price_change=price_change,
                exists=existing_product is not None,
                price_difference=price_diff
            ))

        return ExcelImportPreviewResponse(
            items=preview_items,
            total_items=len(preview_items),
            new_products=new_count,
            existing_products=existing_count,
            price_changes=price_changes
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/import-excel/confirm", response_model=ExcelImportResult)
async def confirm_excel_import(
    items: List[ExcelImportConfirmItem],
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    """Confirma la importación con los precios ajustados por el usuario."""
    results = {"created": 0, "updated": 0, "errors": []}
    
    for item in items:
        try:
            existing_product = crud_products.get_product_by_barcode(db, barcode=item.barcode, tenant_id=tenant_id)
            
            if existing_product:
                existing_product.name = item.name
                existing_product.purchase_price = item.purchase_price
                existing_product.sale_price = item.sale_price
                existing_product.iva_rate = item.iva_rate
                db.commit()
                results["updated"] += 1
            else:
                new_product = models.Product(
                    tenant_id=tenant_id,
                    name=item.name,
                    barcode=item.barcode,
                    purchase_price=item.purchase_price,
                    sale_price=item.sale_price,
                    iva_rate=item.iva_rate
                )
                db.add(new_product)
                db.flush()
                inventory = models.Inventory(product_id=new_product.id, tenant_id=tenant_id, quantity=0)
                db.add(inventory)
                db.commit()
                results["created"] += 1
        except Exception as e:
            db.rollback()
            results["errors"].append({"barcode": item.barcode, "error": str(e)})

    return ExcelImportResult(
        created=results["created"],
        updated=results["updated"],
        errors=results["errors"],
        total_processed=len(items)
    )


# ============================================================================
# ENDPOINTS CRUD BÁSICOS
# ============================================================================

@router.get("/paginated", response_model=schemas.ProductPaginatedResponse)
def read_products_paginated(
    page: int = 1,
    page_size: int = 50,
    search: str = None,
    stock_filter: str = "all",
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    """Obtener lista de medicamentos con paginación"""
    return crud_products.get_products_paginated(
        db, tenant_id=tenant_id, page=page, page_size=page_size, search=search, stock_filter=stock_filter
    )


@router.get("/", response_model=List[schemas.Product])
def read_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    """Obtener lista de medicamentos"""
    return crud_products.get_products(db, tenant_id=tenant_id, skip=skip, limit=limit)


@router.post("/", response_model=schemas.Product)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    """Crear un nuevo medicamento"""
    if product.barcode:
        existing = crud_products.get_product_by_barcode(db, barcode=product.barcode, tenant_id=tenant_id)
        if existing:
            raise HTTPException(status_code=400, detail="Código de barras ya existe")
    return crud_products.create_product(db=db, product=product, tenant_id=tenant_id)


@router.get("/{product_id}", response_model=schemas.Product)
def read_product(
    product_id: int,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    """Obtener un medicamento por ID"""
    db_product = crud_products.get_product(db, product_id=product_id, tenant_id=tenant_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado")
    return db_product


@router.put("/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int,
    product: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    """Actualizar un medicamento existente"""
    return crud_products.update_product(db=db, product_id=product_id, product=product, tenant_id=tenant_id)


@router.delete("/{product_id}", response_model=schemas.Product)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    """Eliminar un medicamento"""
    return crud_products.delete_product(db=db, product_id=product_id, tenant_id=tenant_id)

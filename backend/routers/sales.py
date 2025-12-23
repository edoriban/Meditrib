from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from backend.core.dependencies import get_db
from backend.core import schemas

from backend.core.crud import crud_sale, crud_products, crud_client

router = APIRouter(
    prefix="/sales",
    tags=["sales"],
    responses={404: {"description": "Not found"}},
)


# ============================================================================
# SCHEMAS DE VALIDACIÓN DE STOCK
# ============================================================================

class StockIssue(BaseModel):
    """Problema de stock para un item"""
    product_id: int
    product_name: str
    requested: int
    available: int
    shortage: int


class StockCheckResult(BaseModel):
    """Resultado de verificación de stock"""
    has_issues: bool
    issues: List[StockIssue]


class StockCheckRequest(BaseModel):
    """Request para verificar stock"""
    items: List[schemas.SaleItemCreate]


# ============================================================================
# ENDPOINTS DE VERIFICACIÓN DE STOCK
# ============================================================================

@router.post("/check-stock", response_model=StockCheckResult)
def check_stock_for_sale(request: StockCheckRequest, db: Session = Depends(get_db)):
    """
    Verifica la disponibilidad de stock para los items de una venta.
    Útil para mostrar advertencias antes de confirmar una venta.
    """
    result = crud_sale.check_stock_availability(db, request.items)
    return StockCheckResult(
        has_issues=result["has_issues"],
        issues=[StockIssue(**issue) for issue in result["issues"]]
    )


# ============================================================================
# ENDPOINTS CRUD DE VENTAS
# ============================================================================

@router.post("/", response_model=schemas.Sale)
def create_sale(
    sale: schemas.SaleCreate,
    auto_adjust_stock: bool = Query(False, description="Si es True, permite vender aunque no haya stock suficiente"),
    db: Session = Depends(get_db)
):
    """
    Crea una nueva venta.
    
    - Si auto_adjust_stock es False (default), valida que haya stock suficiente
    - Si auto_adjust_stock es True, permite la venta aunque el stock sea insuficiente
    """
    # Validar existencia de cliente
    db_client = crud_client.get_client(db, client_id=sale.client_id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Validar que hay al menos un item
    if not sale.items or len(sale.items) == 0:
        raise HTTPException(status_code=400, detail="Sale must have at least one item")
    
    # Validar existencia de medicamentos
    for item in sale.items:
        db_product = crud_products.get_product(db, product_id=item.product_id)
        if not db_product:
            raise HTTPException(status_code=404, detail=f"Product with id {item.product_id} not found")
    
    # Verificar stock si no se permite ajuste automático
    if not auto_adjust_stock:
        stock_check = crud_sale.check_stock_availability(db, sale.items)
        if stock_check["has_issues"]:
            issues_detail = ", ".join([
                f"{issue['product_name']}: solicitado {issue['requested']}, disponible {issue['available']}"
                for issue in stock_check["issues"]
            ])
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente: {issues_detail}"
            )

    # Crear la venta
    try:
        created_sale = crud_sale.create_sale(db=db, sale=sale, auto_adjust_stock=auto_adjust_stock)
        return created_sale
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[schemas.Sale])
def read_sales(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    sales = crud_sale.get_sales(db, skip=skip, limit=limit)
    return sales


@router.get("/{sale_id}", response_model=schemas.Sale)
def read_sale(sale_id: int, db: Session = Depends(get_db)):
    db_sale = crud_sale.get_sale(db, sale_id=sale_id)
    if db_sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")
    return db_sale


@router.put("/{sale_id}", response_model=schemas.Sale)
def update_sale(sale_id: int, sale: schemas.SaleUpdate, db: Session = Depends(get_db)):
    db_sale = crud_sale.get_sale(db, sale_id=sale_id)
    if db_sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    # Validar cliente si se actualiza
    if sale.client_id and not crud_client.get_client(db, client_id=sale.client_id):
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Validar items si se actualizan
    if sale.items:
        for item in sale.items:
            db_product = crud_products.get_product(db, product_id=item.product_id)
            if not db_product:
                raise HTTPException(status_code=404, detail=f"Product with id {item.product_id} not found")
    
    return crud_sale.update_sale(db=db, sale_id=sale_id, sale_update=sale)


@router.delete("/{sale_id}", response_model=schemas.Sale)
def delete_sale(sale_id: int, db: Session = Depends(get_db)):
    db_sale = crud_sale.get_sale(db, sale_id=sale_id)
    if db_sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")
    # La eliminación revierte los cambios en inventario
    return crud_sale.delete_sale(db=db, sale_id=sale_id)


@router.get("/client/{client_id}", response_model=List[schemas.Sale])
def read_sales_by_client(client_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtener todas las ventas de un cliente específico"""
    sales = crud_sale.get_sales_by_client(db, client_id=client_id, skip=skip, limit=limit)
    return sales


@router.get("/product/{product_id}", response_model=List[schemas.Sale])
def read_sales_by_product(product_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtener todas las ventas que contienen un medicamento específico"""
    sales = crud_sale.get_sales_by_product(db, product_id=product_id, skip=skip, limit=limit)
    return sales

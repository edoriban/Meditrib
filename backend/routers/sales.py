from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.core import schemas
from backend.core.crud import crud_client, crud_products, crud_sale
from backend.core.dependencies import get_db, get_tenant_id

router = APIRouter(
    prefix="/sales",
    tags=["sales"],
    responses={404: {"description": "Not found"}},
)


class StockIssue(BaseModel):
    product_id: int
    product_name: str
    requested: int
    available: int
    shortage: int


class StockCheckResult(BaseModel):
    has_issues: bool
    issues: list[StockIssue]


class StockCheckRequest(BaseModel):
    items: list[schemas.SaleItemCreate]


@router.post("/check-stock", response_model=StockCheckResult)
def check_stock_for_sale(
    request: StockCheckRequest, db: Session = Depends(get_db), tenant_id: int = Depends(get_tenant_id)
):
    """Verifica disponibilidad de stock"""
    result = crud_sale.check_stock_availability(db, request.items, tenant_id=tenant_id)
    return StockCheckResult(has_issues=result["has_issues"], issues=[StockIssue(**issue) for issue in result["issues"]])


@router.post("/", response_model=schemas.Sale)
def create_sale(
    sale: schemas.SaleCreate,
    auto_adjust_stock: bool = Query(False),
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id),
):
    """Crea una nueva venta"""
    # Validar cliente
    db_client = crud_client.get_client(db, client_id=sale.client_id)
    if not db_client or (db_client.tenant_id and db_client.tenant_id != tenant_id):
        raise HTTPException(status_code=404, detail="Client not found")

    if not sale.items:
        raise HTTPException(status_code=400, detail="Sale must have at least one item")

    # Validar productos
    for item in sale.items:
        db_product = crud_products.get_product(db, product_id=item.product_id, tenant_id=tenant_id)
        if not db_product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

    # Verificar stock
    if not auto_adjust_stock:
        stock_check = crud_sale.check_stock_availability(db, sale.items, tenant_id=tenant_id)
        if stock_check["has_issues"]:
            raise HTTPException(status_code=400, detail="Stock insuficiente")

    try:
        return crud_sale.create_sale(db=db, sale=sale, tenant_id=tenant_id, auto_adjust_stock=auto_adjust_stock)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=list[schemas.Sale])
def read_sales(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), tenant_id: int = Depends(get_tenant_id)):
    """Obtener todas las ventas del tenant"""
    return crud_sale.get_sales(db, tenant_id=tenant_id, skip=skip, limit=limit)


@router.get("/{sale_id}", response_model=schemas.Sale)
def read_sale(sale_id: int, db: Session = Depends(get_db), tenant_id: int = Depends(get_tenant_id)):
    """Obtener una venta por ID"""
    db_sale = crud_sale.get_sale(db, sale_id=sale_id, tenant_id=tenant_id)
    if not db_sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return db_sale


@router.put("/{sale_id}", response_model=schemas.Sale)
def update_sale(
    sale_id: int, sale: schemas.SaleUpdate, db: Session = Depends(get_db), tenant_id: int = Depends(get_tenant_id)
):
    """Actualizar una venta"""
    return crud_sale.update_sale(db=db, sale_id=sale_id, sale_update=sale, tenant_id=tenant_id)


@router.delete("/{sale_id}", response_model=schemas.Sale)
def delete_sale(sale_id: int, db: Session = Depends(get_db), tenant_id: int = Depends(get_tenant_id)):
    """Eliminar una venta"""
    db_sale = crud_sale.delete_sale(db=db, sale_id=sale_id, tenant_id=tenant_id)
    if not db_sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return db_sale

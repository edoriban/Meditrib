from datetime import datetime

from sqlalchemy.orm import Session, joinedload

from backend.core import models, schemas


def calculate_sale_totals(items_subtotal: float, items_iva: float, document_type: str) -> dict:
    """Calcula los totales de una venta basado en el tipo de documento y el IVA por producto"""
    if document_type == "remission":
        # Nota de remisión: sin IVA (aunque los productos lo tengan)
        iva_amount = 0.0
        total = items_subtotal
    else:
        # Factura: suma el IVA de cada producto que lo tenga
        iva_amount = items_iva
        total = items_subtotal + iva_amount

    return {"subtotal": items_subtotal, "iva_amount": iva_amount, "total": total}


def check_stock_availability(db: Session, items: list[schemas.SaleItemCreate], tenant_id: int = None) -> dict:
    """
    Verifica disponibilidad de stock para los items de una venta.
    Retorna información sobre items con stock insuficiente.
    """
    stock_issues = []

    for item_data in items:
        query = db.query(models.Product).filter(models.Product.id == item_data.product_id)
        if tenant_id:
            query = query.filter(models.Product.tenant_id == tenant_id)

        product = query.first()

        if not product:
            stock_issues.append(
                {
                    "product_id": item_data.product_id,
                    "product_name": "Medicamento no encontrado",
                    "requested": item_data.quantity,
                    "available": 0,
                    "shortage": item_data.quantity,
                }
            )
            continue

        inv_query = db.query(models.Inventory).filter(models.Inventory.product_id == item_data.product_id)
        if tenant_id:
            inv_query = inv_query.filter(models.Inventory.tenant_id == tenant_id)

        inventory = inv_query.first()

        available = inventory.quantity if inventory else 0

        if available < item_data.quantity:
            stock_issues.append(
                {
                    "product_id": item_data.product_id,
                    "product_name": product.name,
                    "requested": item_data.quantity,
                    "available": available,
                    "shortage": item_data.quantity - available,
                }
            )

    return {"has_issues": len(stock_issues) > 0, "issues": stock_issues}


def get_sale(db: Session, sale_id: int, tenant_id: int = None):
    query = (
        db.query(models.Sale)
        .options(
            joinedload(models.Sale.items).joinedload(models.SaleItem.product),
            joinedload(models.Sale.client),
            joinedload(models.Sale.user),
        )
        .filter(models.Sale.id == sale_id)
    )
    if tenant_id:
        query = query.filter(models.Sale.tenant_id == tenant_id)
    return query.first()


def get_sales(db: Session, tenant_id: int = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Sale).options(
        joinedload(models.Sale.items).joinedload(models.SaleItem.product),
        joinedload(models.Sale.client),
        joinedload(models.Sale.user),
    )
    if tenant_id:
        query = query.filter(models.Sale.tenant_id == tenant_id)
    return query.order_by(models.Sale.sale_date.desc()).offset(skip).limit(limit).all()


def create_sale(db: Session, sale: schemas.SaleCreate, tenant_id: int = None, auto_adjust_stock: bool = False):
    """
    Crea una venta.
    """
    # Crear la venta principal
    sale_data = sale.model_dump(exclude={"items"})
    if sale_data.get("sale_date") is None:
        sale_data["sale_date"] = datetime.now()

    if tenant_id:
        sale_data["tenant_id"] = tenant_id

    db_sale = models.Sale(**sale_data)
    db.add(db_sale)
    db.flush()

    # Crear los items de la venta y calcular subtotales
    items_subtotal = 0.0
    items_iva = 0.0

    for item_data in sale.items:
        product_query = db.query(models.Product).filter(models.Product.id == item_data.product_id)
        if tenant_id:
            product_query = product_query.filter(models.Product.tenant_id == tenant_id)

        product = product_query.first()

        if not product:
            raise ValueError(f"Medicamento con ID {item_data.product_id} no encontrado o fuera de tu tenant")

        product_iva_rate = product.iva_rate if product else 0.0
        unit_price = item_data.unit_price if item_data.unit_price else product.sale_price

        item_subtotal = (item_data.quantity * unit_price) - item_data.discount
        item_iva = item_subtotal * product_iva_rate
        items_subtotal += item_subtotal
        items_iva += item_iva

        db_item = models.SaleItem(
            tenant_id=tenant_id,
            sale_id=db_sale.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_price=unit_price,
            discount=item_data.discount,
            iva_rate=product_iva_rate,
            subtotal=item_subtotal,
            iva_amount=item_iva,
        )
        db.add(db_item)

        # Manejar inventario
        inv_query = db.query(models.Inventory).filter(models.Inventory.product_id == item_data.product_id)
        if tenant_id:
            inv_query = inv_query.filter(models.Inventory.tenant_id == tenant_id)

        inventory = inv_query.first()

        if inventory:
            if inventory.quantity < item_data.quantity and auto_adjust_stock:
                inventory.quantity = 0
            else:
                inventory.quantity = max(0, inventory.quantity - item_data.quantity)
        elif auto_adjust_stock:
            new_inventory = models.Inventory(product_id=item_data.product_id, tenant_id=tenant_id, quantity=0)
            db.add(new_inventory)

        # Actualizar precio si es necesario
        if item_data.unit_price and item_data.unit_price != product.sale_price:
            product.sale_price = item_data.unit_price

    totals = calculate_sale_totals(items_subtotal, items_iva, sale.document_type)
    db_sale.subtotal = totals["subtotal"]
    db_sale.iva_amount = totals["iva_amount"]
    db_sale.total = totals["total"]

    db.commit()
    db.refresh(db_sale)
    return get_sale(db, db_sale.id, tenant_id=tenant_id)


def update_sale(db: Session, sale_id: int, sale_update: schemas.SaleUpdate, tenant_id: int = None):
    db_sale = get_sale(db, sale_id, tenant_id=tenant_id)
    if not db_sale:
        return None

    update_data = sale_update.model_dump(exclude_unset=True, exclude={"items"})
    for key, value in update_data.items():
        setattr(db_sale, key, value)

    if sale_update.items is not None:
        # Revertir inventario
        for old_item in db_sale.items:
            inv_query = db.query(models.Inventory).filter(models.Inventory.product_id == old_item.product_id)
            if tenant_id:
                inv_query = inv_query.filter(models.Inventory.tenant_id == tenant_id)
            inventory = inv_query.first()
            if inventory:
                inventory.quantity += old_item.quantity

        # Eliminar items anteriores
        db.query(models.SaleItem).filter(models.SaleItem.sale_id == sale_id).delete()

        # Crear nuevos items
        items_subtotal = 0.0
        items_iva = 0.0
        for item_data in sale_update.items:
            prod_query = db.query(models.Product).filter(models.Product.id == item_data.product_id)
            if tenant_id:
                prod_query = prod_query.filter(models.Product.tenant_id == tenant_id)
            product = prod_query.first()

            product_iva_rate = product.iva_rate if product else 0.0
            item_subtotal = (item_data.quantity * item_data.unit_price) - item_data.discount
            item_iva = item_subtotal * product_iva_rate
            items_subtotal += item_subtotal
            items_iva += item_iva

            db_item = models.SaleItem(
                tenant_id=tenant_id,
                sale_id=sale_id,
                product_id=item_data.product_id,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                discount=item_data.discount,
                iva_rate=product_iva_rate,
                subtotal=item_subtotal,
                iva_amount=item_iva,
            )
            db.add(db_item)

            inv_query = db.query(models.Inventory).filter(models.Inventory.product_id == item_data.product_id)
            if tenant_id:
                inv_query = inv_query.filter(models.Inventory.tenant_id == tenant_id)
            inventory = inv_query.first()
            if inventory:
                inventory.quantity = max(0, inventory.quantity - item_data.quantity)

        totals = calculate_sale_totals(items_subtotal, items_iva, db_sale.document_type)
        db_sale.subtotal = totals["subtotal"]
        db_sale.iva_amount = totals["iva_amount"]
        db_sale.total = totals["total"]

    db.commit()
    return get_sale(db, sale_id, tenant_id=tenant_id)


def delete_sale(db: Session, sale_id: int, tenant_id: int = None):
    db_sale = get_sale(db, sale_id, tenant_id=tenant_id)
    if db_sale:
        for item in db_sale.items:
            inv_query = db.query(models.Inventory).filter(models.Inventory.product_id == item.product_id)
            if tenant_id:
                inv_query = inv_query.filter(models.Inventory.tenant_id == tenant_id)
            inventory = inv_query.first()
            if inventory:
                inventory.quantity += item.quantity

        db.delete(db_sale)
        db.commit()
    return db_sale


def get_sales_by_client(db: Session, client_id: int, tenant_id: int = None, skip: int = 0, limit: int = 100):
    query = (
        db.query(models.Sale)
        .options(
            joinedload(models.Sale.items).joinedload(models.SaleItem.product),
            joinedload(models.Sale.client),
            joinedload(models.Sale.user),
        )
        .filter(models.Sale.client_id == client_id)
    )
    if tenant_id:
        query = query.filter(models.Sale.tenant_id == tenant_id)
    return query.order_by(models.Sale.sale_date.desc()).offset(skip).limit(limit).all()


def get_sales_by_product(db: Session, product_id: int, tenant_id: int = None, skip: int = 0, limit: int = 100):
    query = (
        db.query(models.Sale)
        .options(
            joinedload(models.Sale.items).joinedload(models.SaleItem.product),
            joinedload(models.Sale.client),
            joinedload(models.Sale.user),
        )
        .join(models.SaleItem)
        .filter(models.SaleItem.product_id == product_id)
    )
    if tenant_id:
        query = query.filter(models.Sale.tenant_id == tenant_id)
    return query.order_by(models.Sale.sale_date.desc()).offset(skip).limit(limit).all()

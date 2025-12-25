"""
CRUD operations for Products with multi-tenant support.
All queries are filtered by tenant_id to ensure data isolation.
"""

from sqlalchemy import or_
from sqlalchemy.orm import Session

from backend.core import models, schemas


def get_product(db: Session, product_id: int, tenant_id: int = None) -> models.Product | None:
    """Get a single product by ID, optionally filtered by tenant"""
    query = db.query(models.Product).filter(models.Product.id == product_id)
    if tenant_id:
        query = query.filter(models.Product.tenant_id == tenant_id)
    return query.first()


def get_product_by_barcode(db: Session, barcode: str, tenant_id: int = None) -> models.Product | None:
    """Get a product by barcode, optionally filtered by tenant"""
    query = db.query(models.Product).filter(models.Product.barcode == barcode)
    if tenant_id:
        query = query.filter(models.Product.tenant_id == tenant_id)
    return query.first()


def get_products(db: Session, tenant_id: int = None, skip: int = 0, limit: int = 100) -> list[models.Product]:
    """Get list of products with pagination, filtered by tenant"""
    query = db.query(models.Product)
    if tenant_id:
        query = query.filter(models.Product.tenant_id == tenant_id)
    return query.offset(skip).limit(limit).all()


def get_products_paginated(
    db: Session,
    tenant_id: int = None,
    page: int = 1,
    page_size: int = 50,
    search: str = None,
    stock_filter: str = "all",
) -> schemas.ProductPaginatedResponse:
    """Get paginated products with search and stock filtering"""
    query = db.query(models.Product)

    if tenant_id:
        query = query.filter(models.Product.tenant_id == tenant_id)

    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Product.name.ilike(search_term),
                models.Product.barcode.ilike(search_term),
                models.Product.laboratory.ilike(search_term),
                models.Product.active_substance.ilike(search_term),
            )
        )

    # Apply stock filter
    if stock_filter == "in-stock":
        query = query.join(models.Inventory).filter(models.Inventory.quantity > 0)
    elif stock_filter == "out-of-stock":
        query = query.join(models.Inventory).filter(models.Inventory.quantity <= 0)

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    products = query.offset(offset).limit(page_size).all()

    # Calculate pagination info
    total_pages = (total + page_size - 1) // page_size

    return schemas.ProductPaginatedResponse(
        items=products, total=total, page=page, page_size=page_size, total_pages=total_pages
    )


def search_products(db: Session, query: str, tenant_id: int = None) -> list[models.Product]:
    """Search products by name, barcode, or active substance"""
    search_term = f"%{query}%"
    db_query = db.query(models.Product).filter(
        or_(
            models.Product.name.ilike(search_term),
            models.Product.barcode.ilike(search_term),
            models.Product.active_substance.ilike(search_term),
        )
    )
    if tenant_id:
        db_query = db_query.filter(models.Product.tenant_id == tenant_id)
    return db_query.limit(50).all()


def search_products_by_barcode(db: Session, barcode: str, tenant_id: int = None) -> list[models.Product]:
    """Search products by partial barcode match"""
    search_term = f"%{barcode}%"
    query = db.query(models.Product).filter(models.Product.barcode.ilike(search_term))
    if tenant_id:
        query = query.filter(models.Product.tenant_id == tenant_id)
    return query.limit(10).all()


def create_product(db: Session, product: schemas.ProductCreate, tenant_id: int = None) -> models.Product:
    """Create a new product"""
    product_data = product.model_dump(exclude={"inventory"})
    if tenant_id:
        product_data["tenant_id"] = tenant_id

    db_product = models.Product(**product_data)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    # Create inventory if provided
    if hasattr(product, "inventory") and product.inventory:
        inventory = models.Inventory(
            product_id=db_product.id,
            tenant_id=tenant_id,
            quantity=product.inventory.quantity if product.inventory else 0,
        )
        db.add(inventory)
        db.commit()

    return db_product


def update_product(
    db: Session, product_id: int, product: schemas.ProductUpdate, tenant_id: int = None
) -> models.Product | None:
    """Update an existing product"""
    db_product = get_product(db, product_id, tenant_id)
    if not db_product:
        return None

    update_data = product.model_dump(exclude_unset=True, exclude={"inventory"})
    for key, value in update_data.items():
        setattr(db_product, key, value)

    # Update inventory if provided
    if hasattr(product, "inventory") and product.inventory is not None:
        if db_product.inventory:
            db_product.inventory.quantity = product.inventory.quantity
        else:
            inventory = models.Inventory(
                product_id=db_product.id, tenant_id=tenant_id, quantity=product.inventory.quantity
            )
            db.add(inventory)

    db.commit()
    db.refresh(db_product)
    return db_product


def delete_product(db: Session, product_id: int, tenant_id: int = None) -> models.Product | None:
    """Delete a product"""
    db_product = get_product(db, product_id, tenant_id)
    if not db_product:
        return None

    db.delete(db_product)
    db.commit()
    return db_product

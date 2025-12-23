"""
Cleanup task for expired tenant data.
Run this as a scheduled job (cron) to remove data from tenants whose grace period has ended.

Usage:
    python -m backend.tasks.cleanup

This can be scheduled with cron:
    0 2 * * * cd /path/to/project && python -m backend.tasks.cleanup
"""
from datetime import datetime
from sqlalchemy.orm import Session
from backend.core.database import SessionLocal
from backend.core import models
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_expired_tenants(db: Session) -> list:
    """Get all tenants whose grace period has ended"""
    now = datetime.now()
    return db.query(models.Tenant).filter(
        models.Tenant.subscription_status.in_(["expired", "cancelled"]),
        models.Tenant.grace_period_ends_at < now
    ).all()


def delete_tenant_data(db: Session, tenant_id: int, dry_run: bool = False) -> dict:
    """
    Delete all data associated with a tenant.
    Returns count of deleted records.
    """
    counts = {}
    
    # Order matters due to foreign key constraints
    tables_to_clean = [
        ("invoice_taxes", models.InvoiceTax),
        ("invoice_concepts", models.InvoiceConcept),
        ("invoices", models.Invoice),
        ("batch_stock_movements", models.BatchStockMovement),
        ("product_batches", models.ProductBatch),
        ("purchase_order_items", models.PurchaseOrderItem),
        ("purchase_orders", models.PurchaseOrder),
        ("sale_items", models.SaleItem),
        ("sales", models.Sale),
        ("expenses", models.Expense),
        ("expense_categories", models.ExpenseCategory),
        ("alerts", models.Alert),
        ("inventory", models.Inventory),
        ("supplier_products", models.SupplierProduct),
        ("suppliers", models.Supplier),
        ("products", models.Product),
        ("product_tags", models.ProductTag),
        ("clients", models.Client),
        ("companies", models.Company),
        ("app_settings", models.AppSettings),
        ("tenant_invitations", models.TenantInvitation),
        ("users", models.User),
    ]
    
    for table_name, model in tables_to_clean:
        query = db.query(model).filter(model.tenant_id == tenant_id)
        count = query.count()
        counts[table_name] = count
        
        if not dry_run and count > 0:
            query.delete(synchronize_session=False)
    
    if not dry_run:
        # Finally delete the tenant itself
        db.query(models.Tenant).filter(models.Tenant.id == tenant_id).delete()
        db.commit()
        counts["tenant"] = 1
    
    return counts


def run_cleanup(dry_run: bool = True):
    """
    Main cleanup function.
    Set dry_run=False to actually delete data.
    """
    db = SessionLocal()
    try:
        expired_tenants = get_expired_tenants(db)
        
        if not expired_tenants:
            logger.info("No expired tenants found for cleanup")
            return
        
        logger.info(f"Found {len(expired_tenants)} expired tenant(s) for cleanup")
        
        for tenant in expired_tenants:
            logger.info(f"Processing tenant: {tenant.id} - {tenant.name}")
            logger.info(f"  Grace period ended: {tenant.grace_period_ends_at}")
            
            counts = delete_tenant_data(db, tenant.id, dry_run=dry_run)
            
            action = "Would delete" if dry_run else "Deleted"
            for table, count in counts.items():
                if count > 0:
                    logger.info(f"  {action} {count} records from {table}")
            
            if dry_run:
                logger.info("  [DRY RUN] No data was actually deleted")
            else:
                logger.info(f"  Successfully cleaned up tenant {tenant.id}")
        
        logger.info("Cleanup complete")
        
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Cleanup expired tenant data")
    parser.add_argument(
        "--execute",
        action="store_true",
        help="Actually delete data (default is dry run)"
    )
    args = parser.parse_args()
    
    if args.execute:
        logger.warning("EXECUTING CLEANUP - DATA WILL BE DELETED")
        response = input("Are you sure? Type 'yes' to continue: ")
        if response.lower() == "yes":
            run_cleanup(dry_run=False)
        else:
            logger.info("Aborted")
    else:
        logger.info("Running in DRY RUN mode - no data will be deleted")
        run_cleanup(dry_run=True)

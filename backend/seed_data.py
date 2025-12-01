"""
Script para poblar la base de datos con datos iniciales de prueba.
Ejecutar desde la raíz del proyecto: python -m backend.seed_data
"""

from backend.core.database import SessionLocal, engine
from backend.core.models import Base, Medicine, Inventory, Supplier, Client, MedicineTag, User, Role
from passlib.context import CryptContext
from datetime import date, timedelta

# Contexto de password (mismo que en security.py)
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Genera un hash de la contraseña"""
    return pwd_context.hash(password)

def seed_database():
    # Crear las tablas si no existen
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # ==================== ROLES ====================
        print("Creando roles...")
        admin_role = db.query(Role).filter(Role.name == "Administrador").first()
        if not admin_role:
            admin_role = Role(
                name="Administrador",
                description="Acceso completo al sistema"
            )
            db.add(admin_role)
            db.flush()
            print("  ✓ Rol 'Administrador' creado")
        else:
            print("  - Rol 'Administrador' ya existe")

        # ==================== USUARIOS ====================
        print("\nCreando usuarios...")
        admin_user = db.query(User).filter(User.email == "admin@meditrib.com").first()
        if not admin_user:
            admin_user = User(
                name="Administrador",
                email="admin@meditrib.com",
                password=hash_password("admin123"),  # Hash de la contraseña
                role_id=admin_role.id
            )
            db.add(admin_user)
            db.flush()
            print("  ✓ Usuario 'admin@meditrib.com' creado (password: admin123)")
        else:
            # Actualizar la contraseña si ya existe (por si estaba en texto plano)
            admin_user.password = hash_password("admin123")
            db.flush()
            print("  - Usuario 'admin@meditrib.com' ya existe (contraseña actualizada)")

        # ==================== TAGS DE MEDICAMENTOS ====================
        print("\nCreando tags de medicamentos...")
        tags_data = [
            {"name": "Analgésico", "description": "Medicamentos para el dolor", "color": "#f87171"},
            {"name": "Antibiótico", "description": "Medicamentos antibacterianos", "color": "#60a5fa"},
            {"name": "Antiinflamatorio", "description": "Reduce la inflamación", "color": "#4ade80"},
            {"name": "Material de curación", "description": "Gasas, vendas, jeringas", "color": "#facc15"},
        ]
        
        tags = {}
        for tag_data in tags_data:
            existing = db.query(MedicineTag).filter(MedicineTag.name == tag_data["name"]).first()
            if not existing:
                tag = MedicineTag(**tag_data)
                db.add(tag)
                db.flush()
                tags[tag_data["name"]] = tag
                print(f"  ✓ Tag '{tag_data['name']}' creado")
            else:
                tags[tag_data["name"]] = existing
                print(f"  - Tag '{tag_data['name']}' ya existe")

        # ==================== PROVEEDOR ====================
        print("\nCreando proveedores...")
        supplier = db.query(Supplier).filter(Supplier.name == "SEVI").first()
        if not supplier:
            supplier = Supplier(
                name="SEVI",
                contact="555-123-4567"
            )
            db.add(supplier)
            db.flush()
            print("  ✓ Proveedor 'SEVI' creado")
        else:
            print("  - Proveedor 'SEVI' ya existe")

        # ==================== CLIENTE ====================
        print("\nCreando clientes...")
        client = db.query(Client).filter(Client.name == "Doctor 1").first()
        if not client:
            client = Client(
                name="Doctor 1",
                contact="555-987-6543",
                address="Consultorio 101, Col. Centro, CDMX",
                email="doctor1@consultorio.com"
            )
            db.add(client)
            db.flush()
            print("  ✓ Cliente 'Doctor 1' creado")
        else:
            print("  - Cliente 'Doctor 1' ya existe")

        # ==================== MEDICAMENTOS ====================
        print("\nCreando medicamentos...")
        
        medicines_data = [
            {
                "name": "Paracetamol 500mg Tabletas (20)",
                "description": "Analgésico y antipirético. Caja con 20 tabletas de 500mg.",
                "purchase_price": 25.00,
                "sale_price": 45.00,
                "expiration_date": date.today() + timedelta(days=365),
                "batch_number": "LOT-2024-001",
                "barcode": "7501234567001",
                "laboratory": "Genomma Lab",
                "concentration": "500mg",
                "prescription_required": False,
                "iva_rate": 0.0,  # Medicamento exento
                "quantity": 100,
                "tags": ["Analgésico"]
            },
            {
                "name": "Ibuprofeno 400mg Tabletas (10)",
                "description": "Antiinflamatorio no esteroideo. Caja con 10 tabletas de 400mg.",
                "purchase_price": 35.00,
                "sale_price": 65.00,
                "expiration_date": date.today() + timedelta(days=365),
                "batch_number": "LOT-2024-002",
                "barcode": "7501234567002",
                "laboratory": "Bayer",
                "concentration": "400mg",
                "prescription_required": False,
                "iva_rate": 0.0,  # Medicamento exento
                "quantity": 80,
                "tags": ["Analgésico", "Antiinflamatorio"]
            },
            {
                "name": "Amoxicilina 500mg Cápsulas (21)",
                "description": "Antibiótico de amplio espectro. Caja con 21 cápsulas de 500mg.",
                "purchase_price": 85.00,
                "sale_price": 150.00,
                "expiration_date": date.today() + timedelta(days=270),
                "batch_number": "LOT-2024-003",
                "barcode": "7501234567003",
                "laboratory": "Pfizer",
                "concentration": "500mg",
                "prescription_required": True,
                "iva_rate": 0.0,  # Medicamento exento
                "quantity": 50,
                "tags": ["Antibiótico"]
            },
            {
                "name": "Jeringas 5ml (Caja 100)",
                "description": "Jeringas desechables de 5ml con aguja. Caja con 100 piezas.",
                "purchase_price": 180.00,
                "sale_price": 320.00,
                "expiration_date": date.today() + timedelta(days=730),
                "batch_number": "LOT-2024-004",
                "barcode": "7501234567004",
                "laboratory": "BD",
                "concentration": "5ml",
                "prescription_required": False,
                "iva_rate": 0.16,  # Material de curación con IVA
                "quantity": 30,
                "tags": ["Material de curación"]
            },
            {
                "name": "Gasas Estériles 10x10cm (100)",
                "description": "Gasas estériles para curación. Paquete con 100 piezas.",
                "purchase_price": 95.00,
                "sale_price": 180.00,
                "expiration_date": date.today() + timedelta(days=730),
                "batch_number": "LOT-2024-005",
                "barcode": "7501234567005",
                "laboratory": "3M",
                "concentration": "10x10cm",
                "prescription_required": False,
                "iva_rate": 0.16,  # Material de curación con IVA
                "quantity": 40,
                "tags": ["Material de curación"]
            },
        ]

        for med_data in medicines_data:
            existing = db.query(Medicine).filter(Medicine.name == med_data["name"]).first()
            if not existing:
                # Extraer datos que no van en el modelo
                quantity = med_data.pop("quantity")
                tag_names = med_data.pop("tags")
                
                # Crear medicamento
                medicine = Medicine(**med_data)
                
                # Agregar tags
                for tag_name in tag_names:
                    if tag_name in tags:
                        medicine.tags.append(tags[tag_name])
                
                db.add(medicine)
                db.flush()
                
                # Crear inventario
                inventory = Inventory(
                    medicine_id=medicine.id,
                    quantity=quantity
                )
                db.add(inventory)
                
                print(f"  ✓ Medicamento '{med_data['name']}' creado (Stock: {quantity})")
            else:
                print(f"  - Medicamento '{med_data['name']}' ya existe")

        # Confirmar todos los cambios
        db.commit()
        print("\n" + "="*50)
        print("✅ Base de datos poblada exitosamente!")
        print("="*50)
        
        # Resumen
        print("\n📊 Resumen de datos:")
        print(f"   - Medicamentos: {db.query(Medicine).count()}")
        print(f"   - Proveedores: {db.query(Supplier).count()}")
        print(f"   - Clientes: {db.query(Client).count()}")
        print(f"   - Tags: {db.query(MedicineTag).count()}")
        print(f"   - Usuarios: {db.query(User).count()}")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

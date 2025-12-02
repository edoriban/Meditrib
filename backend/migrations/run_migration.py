#!/usr/bin/env python3
"""
Script de migración completo para Meditrib
Este script:
1. Crea todas las tablas nuevas que falten
2. Agrega nuevos campos a tablas existentes
3. Verifica la integridad de la base de datos
"""

import os
import sys
from datetime import datetime

# Agregar el directorio padre al path para importar modelos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker

def get_database_url():
    """Obtiene la URL de la base de datos desde las variables de entorno o usa la por defecto"""
    # Intentar obtener la URL de las variables de entorno
    from dotenv import load_dotenv
    load_dotenv()
    
    # La base de datos está en la raíz del proyecto
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    default_db = os.path.join(project_root, "meditrib.db")
    
    db_url = os.getenv("DATABASE_URL", f"sqlite:///{default_db}")
    return db_url

def create_migration_engine():
    """Crea el engine de la base de datos"""
    db_url = get_database_url()
    print(f"📂 Conectando a la base de datos: {db_url}")
    return create_engine(db_url)

def add_column_if_not_exists(session, table_name: str, column_name: str, column_type: str = "TEXT", default: str = None):
    """Agrega una columna a una tabla si no existe"""
    try:
        engine = session.get_bind()
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns(table_name)]
        
        if column_name not in columns:
            default_clause = f" DEFAULT {default}" if default else ""
            sql = f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}{default_clause}"
            session.execute(text(sql))
            session.commit()
            print(f"  ✅ Agregado: {table_name}.{column_name}")
            return True
        else:
            print(f"  ⏭️  Ya existe: {table_name}.{column_name}")
            return False
    except Exception as e:
        print(f"  ❌ Error al agregar {table_name}.{column_name}: {e}")
        session.rollback()
        return False

def create_table_if_not_exists(session, table_name: str, create_sql: str):
    """Crea una tabla si no existe"""
    try:
        engine = session.get_bind()
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if table_name not in tables:
            session.execute(text(create_sql))
            session.commit()
            print(f"  ✅ Tabla creada: {table_name}")
            return True
        else:
            print(f"  ⏭️  Ya existe: {table_name}")
            return False
    except Exception as e:
        print(f"  ❌ Error al crear tabla {table_name}: {e}")
        session.rollback()
        return False

def run_full_migration():
    """Ejecuta la migración completa"""
    engine = create_migration_engine()
    Session = sessionmaker(bind=engine)
    session = Session()

    print("\n" + "=" * 60)
    print("🚀 MIGRACIÓN DE BASE DE DATOS MEDITRIB")
    print("=" * 60)
    print(f"📅 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60 + "\n")

    try:
        # =====================================================
        # 1. CREAR TABLAS NUEVAS
        # =====================================================
        print("📦 PASO 1: Creando tablas nuevas...")
        print("-" * 40)

        # Tabla de categorías de gastos
        create_table_if_not_exists(session, "expense_categories", """
            CREATE TABLE expense_categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                type TEXT DEFAULT 'variable',
                color TEXT
            )
        """)

        # Tabla de gastos
        create_table_if_not_exists(session, "expenses", """
            CREATE TABLE expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                description TEXT NOT NULL,
                amount REAL NOT NULL,
                expense_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                category_id INTEGER,
                payment_method TEXT,
                supplier TEXT,
                invoice_number TEXT,
                is_tax_deductible INTEGER DEFAULT 1,
                tax_amount REAL DEFAULT 0.0,
                notes TEXT,
                created_by INTEGER,
                FOREIGN KEY (category_id) REFERENCES expense_categories(id),
                FOREIGN KEY (created_by) REFERENCES users(id)
            )
        """)

        # Tabla de empresas (emisoras de facturas)
        create_table_if_not_exists(session, "companies", """
            CREATE TABLE companies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rfc TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                tax_regime TEXT NOT NULL,
                street TEXT,
                exterior_number TEXT,
                interior_number TEXT,
                neighborhood TEXT,
                city TEXT,
                state TEXT,
                country TEXT DEFAULT 'México',
                postal_code TEXT,
                email TEXT,
                phone TEXT
            )
        """)

        # Tabla de facturas
        create_table_if_not_exists(session, "invoices", """
            CREATE TABLE invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE,
                serie TEXT DEFAULT 'A',
                folio TEXT,
                invoice_type TEXT DEFAULT 'I',
                payment_form TEXT,
                payment_method TEXT,
                currency TEXT DEFAULT 'MXN',
                exchange_rate REAL DEFAULT 1.0,
                subtotal REAL,
                discount REAL DEFAULT 0.0,
                total REAL,
                total_taxes REAL DEFAULT 0.0,
                issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                certification_date DATETIME,
                company_id INTEGER,
                client_id INTEGER,
                sale_id INTEGER NOT NULL,
                status TEXT DEFAULT 'draft',
                cfdi_xml TEXT,
                cancellation_reason TEXT,
                FOREIGN KEY (company_id) REFERENCES companies(id),
                FOREIGN KEY (client_id) REFERENCES clients(id),
                FOREIGN KEY (sale_id) REFERENCES sales(id)
            )
        """)

        # Tabla de conceptos de factura
        create_table_if_not_exists(session, "invoice_concepts", """
            CREATE TABLE invoice_concepts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_id INTEGER NOT NULL,
                quantity REAL NOT NULL,
                unit TEXT,
                description TEXT NOT NULL,
                unit_price REAL NOT NULL,
                amount REAL NOT NULL,
                discount REAL DEFAULT 0.0,
                medicine_id INTEGER,
                FOREIGN KEY (invoice_id) REFERENCES invoices(id),
                FOREIGN KEY (medicine_id) REFERENCES medicines(id)
            )
        """)

        # Tabla de impuestos de factura
        create_table_if_not_exists(session, "invoice_taxes", """
            CREATE TABLE invoice_taxes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_id INTEGER NOT NULL,
                tax_type TEXT NOT NULL,
                tax_rate REAL NOT NULL,
                tax_amount REAL NOT NULL,
                tax_base REAL NOT NULL,
                FOREIGN KEY (invoice_id) REFERENCES invoices(id)
            )
        """)

        # Tabla de lotes de medicamentos
        create_table_if_not_exists(session, "medicine_batches", """
            CREATE TABLE medicine_batches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                medicine_id INTEGER NOT NULL,
                batch_number TEXT NOT NULL,
                expiration_date DATE NOT NULL,
                quantity_received INTEGER DEFAULT 0,
                quantity_remaining INTEGER DEFAULT 0,
                unit_cost REAL,
                supplier_id INTEGER,
                received_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                notes TEXT,
                FOREIGN KEY (medicine_id) REFERENCES medicines(id),
                FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
            )
        """)

        # Tabla de movimientos de stock por lote
        create_table_if_not_exists(session, "batch_stock_movements", """
            CREATE TABLE batch_stock_movements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                batch_id INTEGER NOT NULL,
                movement_type TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                previous_quantity INTEGER,
                new_quantity INTEGER,
                reason TEXT,
                reference_id TEXT,
                movement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                user_id INTEGER,
                FOREIGN KEY (batch_id) REFERENCES medicine_batches(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        # Tabla de alertas
        create_table_if_not_exists(session, "alerts", """
            CREATE TABLE alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                message TEXT NOT NULL,
                medicine_id INTEGER,
                severity TEXT DEFAULT 'medium',
                is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                resolved_at DATETIME,
                FOREIGN KEY (medicine_id) REFERENCES medicines(id)
            )
        """)

        # Tabla de tags de medicamentos
        create_table_if_not_exists(session, "medicine_tags", """
            CREATE TABLE medicine_tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                color TEXT
            )
        """)

        # Tabla de asociación medicina-tag
        create_table_if_not_exists(session, "medicine_tag_association", """
            CREATE TABLE medicine_tag_association (
                medicine_id INTEGER NOT NULL,
                tag_id INTEGER NOT NULL,
                PRIMARY KEY (medicine_id, tag_id),
                FOREIGN KEY (medicine_id) REFERENCES medicines(id),
                FOREIGN KEY (tag_id) REFERENCES medicine_tags(id)
            )
        """)

        # =====================================================
        # 2. AGREGAR CAMPOS NUEVOS A TABLAS EXISTENTES
        # =====================================================
        print("\n📝 PASO 2: Agregando campos nuevos a tablas existentes...")
        print("-" * 40)

        # Campos para la tabla clients
        print("\n👥 Tabla: clients")
        add_column_if_not_exists(session, "clients", "address", "TEXT")
        add_column_if_not_exists(session, "clients", "email", "TEXT")
        add_column_if_not_exists(session, "clients", "rfc", "TEXT")
        add_column_if_not_exists(session, "clients", "tax_regime", "TEXT")
        add_column_if_not_exists(session, "clients", "cfdi_use", "TEXT")
        add_column_if_not_exists(session, "clients", "fiscal_street", "TEXT")
        add_column_if_not_exists(session, "clients", "fiscal_exterior_number", "TEXT")
        add_column_if_not_exists(session, "clients", "fiscal_interior_number", "TEXT")
        add_column_if_not_exists(session, "clients", "fiscal_neighborhood", "TEXT")
        add_column_if_not_exists(session, "clients", "fiscal_city", "TEXT")
        add_column_if_not_exists(session, "clients", "fiscal_state", "TEXT")
        add_column_if_not_exists(session, "clients", "fiscal_postal_code", "TEXT")
        add_column_if_not_exists(session, "clients", "fiscal_country", "TEXT", "'México'")

        # Campos para la tabla medicines
        print("\n💊 Tabla: medicines")
        add_column_if_not_exists(session, "medicines", "barcode", "TEXT")
        add_column_if_not_exists(session, "medicines", "laboratory", "TEXT")
        add_column_if_not_exists(session, "medicines", "concentration", "TEXT")
        add_column_if_not_exists(session, "medicines", "prescription_required", "INTEGER", "0")
        add_column_if_not_exists(session, "medicines", "iva_rate", "REAL", "0.0")
        add_column_if_not_exists(session, "medicines", "sat_key", "TEXT")
        add_column_if_not_exists(session, "medicines", "image_path", "TEXT")
        add_column_if_not_exists(session, "medicines", "active_substance", "TEXT")

        # Campos para la tabla sales
        print("\n🛒 Tabla: sales")
        add_column_if_not_exists(session, "sales", "shipping_date", "DATE")
        add_column_if_not_exists(session, "sales", "shipping_status", "TEXT", "'pending'")
        add_column_if_not_exists(session, "sales", "payment_status", "TEXT", "'pending'")
        add_column_if_not_exists(session, "sales", "payment_method", "TEXT")
        add_column_if_not_exists(session, "sales", "document_type", "TEXT", "'invoice'")
        add_column_if_not_exists(session, "sales", "iva_rate", "REAL", "0.16")
        add_column_if_not_exists(session, "sales", "subtotal", "REAL", "0.0")
        add_column_if_not_exists(session, "sales", "iva_amount", "REAL", "0.0")
        add_column_if_not_exists(session, "sales", "notes", "TEXT")

        # Campos para la tabla purchase_orders
        print("\n📦 Tabla: purchase_orders")
        add_column_if_not_exists(session, "purchase_orders", "expected_delivery_date", "DATETIME")
        add_column_if_not_exists(session, "purchase_orders", "status", "TEXT", "'pending'")
        add_column_if_not_exists(session, "purchase_orders", "total_amount", "REAL")

        # =====================================================
        # 3. CREAR CATEGORÍAS DE GASTOS POR DEFECTO
        # =====================================================
        print("\n📊 PASO 3: Insertando datos por defecto...")
        print("-" * 40)

        try:
            # Verificar si ya hay categorías
            result = session.execute(text("SELECT COUNT(*) FROM expense_categories")).scalar()
            
            if result == 0:
                print("  📁 Insertando categorías de gastos por defecto...")
                default_categories = [
                    ("Renta", "Pago de renta del local", "fixed", "#3b82f6"),
                    ("Servicios", "Luz, agua, gas, internet", "fixed", "#10b981"),
                    ("Nómina", "Sueldos y salarios", "fixed", "#8b5cf6"),
                    ("Proveedores", "Pagos a proveedores de medicamentos", "variable", "#f59e0b"),
                    ("Transporte", "Gastos de envío y fletes", "variable", "#ef4444"),
                    ("Mantenimiento", "Reparaciones y mantenimiento", "variable", "#6366f1"),
                    ("Impuestos", "Pagos de impuestos", "fixed", "#ec4899"),
                    ("Otros", "Gastos varios", "variable", "#64748b"),
                ]
                
                for name, description, type_, color in default_categories:
                    session.execute(text(
                        "INSERT INTO expense_categories (name, description, type, color) VALUES (:name, :desc, :type, :color)"
                    ), {"name": name, "desc": description, "type": type_, "color": color})
                
                session.commit()
                print(f"  ✅ {len(default_categories)} categorías de gastos creadas")
            else:
                print(f"  ⏭️  Ya existen {result} categorías de gastos")
        except Exception as e:
            print(f"  ❌ Error al insertar categorías: {e}")
            session.rollback()

        # =====================================================
        # 4. VERIFICACIÓN FINAL
        # =====================================================
        print("\n🔍 PASO 4: Verificación final...")
        print("-" * 40)
        
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        required_tables = [
            "users", "roles", "clients", "suppliers", "medicines", "inventory",
            "sales", "sale_items", "purchase_orders", "purchase_order_items",
            "companies", "invoices", "invoice_concepts", "invoice_taxes",
            "expenses", "expense_categories", "alerts", "medicine_batches",
            "batch_stock_movements", "medicine_tags", "medicine_tag_association"
        ]
        
        missing_tables = [t for t in required_tables if t not in tables]
        
        if missing_tables:
            print(f"  ⚠️  Tablas faltantes: {', '.join(missing_tables)}")
        else:
            print("  ✅ Todas las tablas requeridas existen")

        print("\n" + "=" * 60)
        print("✅ MIGRACIÓN COMPLETADA EXITOSAMENTE")
        print("=" * 60)
        print("\n📝 Resumen:")
        print(f"   - Tablas en la base de datos: {len(tables)}")
        print(f"   - Tablas requeridas: {len(required_tables)}")
        if missing_tables:
            print(f"   - Tablas faltantes: {len(missing_tables)}")
        print("\n🎉 La base de datos está lista para usar.")

    except Exception as e:
        print(f"\n❌ ERROR DURANTE LA MIGRACIÓN: {e}")
        session.rollback()
        raise
    finally:
        session.close()

if __name__ == "__main__":
    print("\n" + "🔄" * 30)
    print("\n  MEDITRIB - Script de Migración de Base de Datos")
    print("  Versión: 2.0")
    print("\n" + "🔄" * 30)
    
    print("\n⚠️  IMPORTANTE: Asegúrate de tener un respaldo de tu base de datos")
    print("   antes de continuar con la migración.\n")
    
    try:
        run_full_migration()
    except Exception as e:
        print(f"\n💥 Error fatal: {e}")
        sys.exit(1)

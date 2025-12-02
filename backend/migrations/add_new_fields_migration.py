#!/usr/bin/env python3
"""
Script de migración para agregar nuevos campos a la base de datos
Este script agrega los campos necesarios para la nueva versión de Meditrib
"""

import os
import sys
from sqlalchemy import create_engine, Column, String, Float, ForeignKey, Integer, DateTime, Date, Boolean, Table
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

# Agregar el directorio padre al path para importar modelos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.models import Base, Client, Medicine, Invoice

def create_migration_engine():
    """Crea el engine de la base de datos"""
    # Usar la misma configuración que la aplicación principal
    db_url = "sqlite:///meditrib.db"
    return create_engine(db_url)

def add_new_fields_to_database():
    """Agrega los nuevos campos a las tablas existentes"""
    engine = create_migration_engine()
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        print("🔧 Iniciando migración de base de datos...")
        print("⏳ Esto puede tomar unos minutos dependiendo del tamaño de la base de datos...")

        # 1. Agregar campos de dirección fiscal a la tabla clients
        print("📍 Agregando campos de dirección fiscal a clientes...")
        try:
            # Verificar si los campos ya existen
            inspector = inspect(engine)
            client_columns = [col['name'] for col in inspector.get_columns('clients')]

            # Campos que necesitamos agregar
            required_client_fields = [
                'fiscal_street', 'fiscal_exterior_number', 'fiscal_interior_number',
                'fiscal_neighborhood', 'fiscal_city', 'fiscal_state',
                'fiscal_postal_code', 'fiscal_country'
            ]

            # Solo agregar campos que no existan
            for field in required_client_fields:
                if field not in client_columns:
                    print(f"✅ Agregando campo {field} a tabla clients")
                    # Usar ALTER TABLE para SQLite
                    session.execute(f"ALTER TABLE clients ADD COLUMN {field} TEXT")
                    session.commit()
                else:
                    print(f"✅ Campo {field} ya existe en tabla clients")

        except Exception as e:
            print(f"❌ Error al agregar campos a clients: {e}")
            session.rollback()

        # 2. Agregar campos a la tabla medicines
        print("💊 Agregando campos a medicamentos...")
        try:
            # Verificar si los campos ya existen
            inspector = inspect(engine)
            medicine_columns = [col['name'] for col in inspector.get_columns('medicines')]

            # Campos que necesitamos agregar
            required_medicine_fields = [
                'sat_key', 'image_path', 'active_substance'
            ]

            # Solo agregar campos que no existan
            for field in required_medicine_fields:
                if field not in medicine_columns:
                    print(f"✅ Agregando campo {field} a tabla medicines")
                    # Usar ALTER TABLE para SQLite
                    session.execute(f"ALTER TABLE medicines ADD COLUMN {field} TEXT")
                    session.commit()
                else:
                    print(f"✅ Campo {field} ya existe en tabla medicines")

        except Exception as e:
            print(f"❌ Error al agregar campos a medicines: {e}")
            session.rollback()

        # 3. Actualizar restricción de sale_id en invoices
        print("📄 Actualizando restricción de sale_id en facturas...")
        try:
            # Verificar la estructura actual de la tabla invoices
            inspector = inspect(engine)
            invoice_columns = {col['name']: col for col in inspector.get_columns('invoices')}

            # Verificar si sale_id es nullable
            sale_id_col = invoice_columns.get('sale_id')
            if sale_id_col and sale_id_col['nullable']:
                print("✅ Actualizando sale_id para que sea requerido...")
                # Para SQLite, necesitamos crear una nueva tabla y migrar datos
                # Este es un proceso complejo, así que lo haremos en pasos

                # Paso 1: Crear tabla temporal
                session.execute("""
                CREATE TABLE IF NOT EXISTS invoices_temp (
                    id INTEGER PRIMARY KEY,
                    uuid TEXT UNIQUE,
                    serie TEXT DEFAULT 'A',
                    folio TEXT,
                    invoice_type TEXT DEFAULT 'I',
                    payment_form TEXT,
                    payment_method TEXT,
                    currency TEXT DEFAULT 'MXN',
                    exchange_rate FLOAT DEFAULT 1.0,
                    subtotal FLOAT,
                    discount FLOAT DEFAULT 0.0,
                    total FLOAT,
                    total_taxes FLOAT DEFAULT 0.0,
                    issue_date DATETIME,
                    certification_date DATETIME,
                    company_id INTEGER,
                    client_id INTEGER,
                    sale_id INTEGER NOT NULL,
                    status TEXT DEFAULT 'draft',
                    cfdi_xml TEXT,
                    cancellation_reason TEXT,
                    FOREIGN KEY(company_id) REFERENCES companies(id),
                    FOREIGN KEY(client_id) REFERENCES clients(id),
                    FOREIGN KEY(sale_id) REFERENCES sales(id)
                )
                """)

                # Paso 2: Copiar datos existentes
                session.execute("""
                INSERT INTO invoices_temp
                SELECT * FROM invoices
                """)

                # Paso 3: Eliminar tabla antigua
                session.execute("DROP TABLE invoices")

                # Paso 4: Renombrar tabla temporal
                session.execute("ALTER TABLE invoices_temp RENAME TO invoices")

                session.commit()
                print("✅ Restricción de sale_id actualizada correctamente")
            else:
                print("✅ sale_id ya es requerido en la tabla invoices")

        except Exception as e:
            print(f"❌ Error al actualizar restricción de sale_id: {e}")
            session.rollback()

        print("✅ Migración completada con éxito!")
        print("🎉 Todos los campos necesarios han sido agregados a la base de datos.")

    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        session.rollback()
    finally:
        session.close()

def verify_migration():
    """Verifica que la migración se haya completado correctamente"""
    engine = create_migration_engine()
    inspector = inspect(engine)

    print("\n🔍 Verificando migración...")

    # Verificar campos de clientes
    client_columns = [col['name'] for col in inspector.get_columns('clients')]
    required_client_fields = [
        'fiscal_street', 'fiscal_exterior_number', 'fiscal_interior_number',
        'fiscal_neighborhood', 'fiscal_city', 'fiscal_state',
        'fiscal_postal_code', 'fiscal_country'
    ]

    client_ok = all(field in client_columns for field in required_client_fields)

    # Verificar campos de medicamentos
    medicine_columns = [col['name'] for col in inspector.get_columns('medicines')]
    required_medicine_fields = ['sat_key', 'image_path', 'active_substance']

    medicine_ok = all(field in medicine_columns for field in required_medicine_fields)

    # Verificar restricción de sale_id
    invoice_columns = {col['name']: col for col in inspector.get_columns('invoices')}
    sale_id_col = invoice_columns.get('sale_id')
    invoice_ok = sale_id_col and not sale_id_col['nullable']

    print(f"✅ Campos de cliente: {'OK' if client_ok else 'FAIL'}")
    print(f"✅ Campos de medicamentos: {'OK' if medicine_ok else 'FAIL'}")
    print(f"✅ Restricción de facturas: {'OK' if invoice_ok else 'FAIL'}")

    if client_ok and medicine_ok and invoice_ok:
        print("🎉 ¡Migración verificada con éxito!")
        return True
    else:
        print("❌ La migración tiene problemas")
        return False

if __name__ == "__main__":
    from sqlalchemy import inspect

    print("🚀 Script de Migración de Meditrib - Nueva Versión")
    print("=" * 50)

    # Ejecutar migración
    add_new_fields_to_database()

    # Verificar migración
    if verify_migration():
        print("\n🎊 ¡Migración completada exitosamente!")
        print("✅ La base de datos está lista para la nueva versión.")
    else:
        print("\n❌ Hubo problemas durante la migración.")
        print("⚠️  Por favor revisa los errores y ejecuta el script nuevamente.")

    print("\n📝 Notas importantes:")
    print("- Este script debe ejecutarse una sola vez")
    print("- Asegúrate de tener una copia de seguridad de tu base de datos antes de ejecutar")
    print("- La migración puede tardar varios minutos en bases de datos grandes")
#!/usr/bin/env python3
"""
Script de migración para agregar nuevos campos a la tabla companies
Agrega: business_name, logo
"""

import os
import sys
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker

# Agregar el directorio padre al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def create_migration_engine():
    """Crea el engine de la base de datos"""
    db_url = "sqlite:///meditrib.db"
    return create_engine(db_url)


def add_company_fields():
    """Agrega los nuevos campos a la tabla companies"""
    engine = create_migration_engine()
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        print("🔧 Iniciando migración de tabla companies...")

        inspector = inspect(engine)
        
        # Verificar si la tabla companies existe
        if 'companies' not in inspector.get_table_names():
            print("⚠️  La tabla companies no existe. Se creará automáticamente al iniciar el servidor.")
            return

        company_columns = [col['name'] for col in inspector.get_columns('companies')]

        # Campos que necesitamos agregar
        new_fields = {
            'business_name': 'TEXT',
            'logo': 'TEXT'
        }

        for field, field_type in new_fields.items():
            if field not in company_columns:
                print(f"✅ Agregando campo {field} a tabla companies...")
                session.execute(text(f"ALTER TABLE companies ADD COLUMN {field} {field_type}"))
                session.commit()
            else:
                print(f"✅ Campo {field} ya existe en tabla companies")

        print("✅ Migración de companies completada!")

    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        session.rollback()
    finally:
        session.close()


if __name__ == "__main__":
    print("🚀 Migración: Agregar campos a tabla companies")
    print("=" * 50)
    add_company_fields()
    print("\n✅ Migración finalizada")

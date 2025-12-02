"""
Migración: Remover restricción UNIQUE del campo 'name' en la tabla medicines.
El código de barras (barcode) es el identificador único real.
"""
import sqlite3
import os

def run_migration():
    # Ruta a la base de datos
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "meditrib.db")
    
    if not os.path.exists(db_path):
        print(f"❌ Base de datos no encontrada en: {db_path}")
        return False
    
    print(f"📂 Conectando a: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # SQLite no permite ALTER TABLE para quitar índices directamente,
        # pero podemos eliminar el índice UNIQUE si existe
        
        # Primero, ver los índices existentes
        cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='medicines'")
        indexes = cursor.fetchall()
        print(f"📋 Índices existentes en medicines: {[idx[0] for idx in indexes]}")
        
        # Buscar y eliminar índices UNIQUE en 'name'
        for idx in indexes:
            idx_name = idx[0]
            # Los índices automáticos de SQLite para UNIQUE empiezan con 'sqlite_autoindex'
            # o pueden ser índices creados manualmente
            if 'name' in idx_name.lower() or 'autoindex_medicines' in idx_name:
                cursor.execute(f"SELECT sql FROM sqlite_master WHERE name='{idx_name}'")
                idx_sql = cursor.fetchone()
                print(f"  - Índice encontrado: {idx_name}")
                if idx_sql and idx_sql[0]:
                    print(f"    SQL: {idx_sql[0]}")
        
        # Para SQLite, la única forma de quitar una restricción UNIQUE definida en la columna
        # es recrear la tabla. Pero si solo queremos permitir duplicados, podemos:
        # 1. Crear una nueva tabla sin la restricción
        # 2. Copiar los datos
        # 3. Eliminar la tabla vieja
        # 4. Renombrar la nueva
        
        print("\n🔄 Recreando tabla medicines sin restricción UNIQUE en 'name'...")
        
        # Obtener la estructura actual
        cursor.execute("PRAGMA table_info(medicines)")
        columns = cursor.fetchall()
        print(f"📋 Columnas: {[col[1] for col in columns]}")
        
        # Crear tabla temporal con la nueva estructura
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS medicines_new (
                id INTEGER PRIMARY KEY,
                name VARCHAR,
                description VARCHAR,
                purchase_price FLOAT,
                sale_price FLOAT,
                expiration_date DATE,
                batch_number VARCHAR,
                barcode VARCHAR UNIQUE,
                laboratory VARCHAR,
                concentration VARCHAR,
                prescription_required BOOLEAN DEFAULT 0,
                iva_rate FLOAT DEFAULT 0.0,
                sat_key VARCHAR,
                image_path VARCHAR,
                active_substance VARCHAR
            )
        """)
        
        # Copiar datos
        cursor.execute("""
            INSERT INTO medicines_new 
            SELECT id, name, description, purchase_price, sale_price, 
                   expiration_date, batch_number, barcode, laboratory,
                   concentration, prescription_required, iva_rate, 
                   sat_key, image_path, active_substance
            FROM medicines
        """)
        
        # Eliminar tabla vieja
        cursor.execute("DROP TABLE medicines")
        
        # Renombrar nueva tabla
        cursor.execute("ALTER TABLE medicines_new RENAME TO medicines")
        
        # Crear índice en name (sin UNIQUE) para búsquedas rápidas
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_medicines_name ON medicines(name)")
        
        # Crear índice en barcode
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_medicines_barcode ON medicines(barcode)")
        
        conn.commit()
        print("✅ Migración completada exitosamente")
        print("   - Restricción UNIQUE removida del campo 'name'")
        print("   - Índice de búsqueda creado en 'name'")
        print("   - barcode sigue siendo el identificador único")
        
        # Verificar
        cursor.execute("SELECT COUNT(*) FROM medicines")
        count = cursor.fetchone()[0]
        print(f"\n📊 Total de medicamentos en la tabla: {count}")
        
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error en migración: {e}")
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()

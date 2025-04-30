from sqlalchemy import text
from core.database import engine  # Importa tu engine

sql_command = "ALTER TABLE medicines ADD COLUMN purchase_price FLOAT;"

try:
    with engine.connect() as connection:
        connection.execute(text(sql_command))
        connection.commit()  # Asegúrate de hacer commit para que el cambio persista
    print("Columna 'purchase_price' añadida exitosamente a la tabla 'medicines'.")
except Exception as e:
    print(f"Error al añadir la columna 'purchase_price': {e}")
    print("Es posible que la columna ya exista o haya otro problema con la tabla.")

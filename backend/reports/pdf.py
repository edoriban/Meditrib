import os
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle

from backend.core.models import Product


def generate_product_report(db, output_dir="reports"):
    """
    Genera un informe PDF con la lista de medicamentos y precios.

    Args:
        db: Sesión de base de datos
        output_dir: Directorio donde se guardará el informe

    Returns:
        str: Ruta del archivo PDF generado
    """
    try:
        products = db.query(Product).all()
        if not products:
            return None

        # Crear directorio si no existe
        os.makedirs(output_dir, exist_ok=True)

        # Crear nombre de archivo con timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_name = f"products_report_{timestamp}.pdf"
        file_path = os.path.join(output_dir, file_name)

        data = [["Nombre", "Precio"]]
        for m in products:
            data.append([m.name, m.sale_price])

        # Usar context manager para asegurar el cierre adecuado de recursos
        pdf = SimpleDocTemplate(file_path, pagesize=letter)
        table = Table(data)
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ]
            )
        )
        pdf.build([table])
        return file_path

    except Exception as e:
        # Registrar el error en lugar de simplemente imprimir
        print(f"Error al generar el informe PDF: {e}")
        return None

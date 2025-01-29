from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors
from backend.models import Medicine
from backend.database import SessionLocal


def generate_medicine_report(db):
    medicines = db.query(Medicine).all()
    data = [["Name", "Price"]]
    for m in medicines:
        data.append([m.name, m.sale_price])

    file_path = "medicines_report.pdf"
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

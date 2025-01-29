import pandas as pd
from backend.models import Medicamento


def generar_excel_medicamentos(session):
    medicamentos = session.query(Medicamento).all()
    df = pd.DataFrame([(m.nombre, m.precio_venta) for m in medicamentos], columns=["Nombre", "Precio"])
    df.to_excel("lista_precios.xlsx", index=False)

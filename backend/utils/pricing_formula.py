#!/usr/bin/env python3
"""
Fórmula de precios para medicamentos
Este módulo contiene la lógica para calcular precios de venta
basado en precios de compra con márgenes por rangos
"""


def calculate_sale_price(purchase_price: float) -> float:
    """
    Calcula el precio de venta basado en el precio de compra
    con márgenes por rangos para distribución farmacéutica.

    Args:
        purchase_price (float): Precio de compra del medicamento

    Returns:
        float: Precio de venta sugerido
    """
    if purchase_price <= 10:
        return round(purchase_price * 1.70, 2)  # 70% margen
    elif purchase_price <= 25:
        return round(purchase_price * 1.60, 2)  # 60% margen
    elif purchase_price <= 50:
        return round(purchase_price * 1.50, 2)  # 50% margen
    elif purchase_price <= 100:
        return round(purchase_price * 1.40, 2)  # 40% margen
    elif purchase_price <= 200:
        return round(purchase_price * 1.35, 2)  # 35% margen
    elif purchase_price <= 500:
        return round(purchase_price * 1.30, 2)  # 30% margen
    else:
        return round(purchase_price * 1.25, 2)  # 25% margen


def get_price_range(purchase_price: float) -> str:
    """
    Obtiene el rango de precio y margen aplicado

    Args:
        purchase_price (float): Precio de compra

    Returns:
        str: Descripción del rango y margen
    """
    if purchase_price <= 10:
        return "≤ $10.00 (70% margen)"
    elif purchase_price <= 25:
        return "$10.01 - $25.00 (60% margen)"
    elif purchase_price <= 50:
        return "$25.01 - $50.00 (50% margen)"
    elif purchase_price <= 100:
        return "$50.01 - $100.00 (40% margen)"
    elif purchase_price <= 200:
        return "$100.01 - $200.00 (35% margen)"
    elif purchase_price <= 500:
        return "$200.01 - $500.00 (30% margen)"
    else:
        return "> $500.00 (25% margen)"


def calculate_price_difference(old_price: float, new_price: float) -> dict:
    """
    Calcula la diferencia entre precios y el porcentaje de cambio

    Args:
        old_price (float): Precio anterior
        new_price (float): Precio nuevo

    Returns:
        dict: Información de la diferencia
    """
    if old_price == 0:
        return {
            "difference": new_price,
            "percentage_change": 100.0,
            "direction": "new",
            "formatted": f"Nuevo: ${new_price:.2f}",
        }

    difference = new_price - old_price
    percentage_change = (difference / old_price) * 100

    return {
        "difference": difference,
        "percentage_change": percentage_change,
        "direction": "up" if difference > 0 else "down" if difference < 0 else "same",
        "formatted": (
            f"↑ ${difference:.2f} ({percentage_change:.1f}%)"
            if difference > 0
            else f"↓ ${abs(difference):.2f} ({abs(percentage_change):.1f}%)"
            if difference < 0
            else "Sin cambio"
        ),
    }

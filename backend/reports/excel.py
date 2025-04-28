import pandas as pd
from backend.core.models import Medicine
import os
from datetime import datetime


def generate_medicine_excel(db, output_dir="reports"):
    """
    Generates an Excel report with medicine prices.

    Args:
        db: Database session
        output_dir: Directory to save the report

    Returns:
        str: Path to the generated Excel file
    """
    try:
        medicines = db.query(Medicine).all()
        if not medicines:
            return None

        # Create directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)

        # Create filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_name = f"medicine_prices_{timestamp}.xlsx"
        file_path = os.path.join(output_dir, file_name)

        # Create DataFrame with medicine data
        df = pd.DataFrame([(m.name, m.sale_price) for m in medicines], columns=["Name", "Price"])

        # Write to Excel
        df.to_excel(file_path, index=False)
        return file_path

    except Exception as e:
        print(f"Error generating Excel report: {e}")
        return None

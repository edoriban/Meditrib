"""
Tests for Sales API endpoints - Critical inventory logic
"""
import pytest


class TestSalesInventory:
    """Tests for the critical sales/inventory interaction"""

    def test_create_sale_decrements_inventory(
        self, client, sample_medicine, sample_client, sample_user, db_session
    ):
        """
        CRITICAL TEST: Verify that creating a sale correctly reduces inventory.

        Given:
            - A medicine with 100 units in stock
            - A valid client and user
        When:
            - A sale of 5 units is created
        Then:
            - The API returns 200 OK
            - The inventory is reduced to 95 units
        """
        # Arrange
        initial_stock = sample_medicine.inventory.quantity
        quantity_to_sell = 5

        sale_data = {
            "client_id": sample_client.id,
            "user_id": sample_user.id,
            "items": [
                {
                    "medicine_id": sample_medicine.id,
                    "quantity": quantity_to_sell,
                    "unit_price": sample_medicine.sale_price,
                }
            ],
        }

        # Act
        response = client.post("/api/v1/sales/", json=sale_data)

        # Assert - Response is successful
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

        # Assert - Inventory was decremented
        db_session.refresh(sample_medicine.inventory)
        expected_stock = initial_stock - quantity_to_sell
        assert sample_medicine.inventory.quantity == expected_stock, (
            f"Expected stock to be {expected_stock}, but got {sample_medicine.inventory.quantity}"
        )

    def test_create_sale_fails_with_insufficient_stock(
        self, client, sample_medicine, sample_client, sample_user
    ):
        """
        Verify that a sale fails when requesting more than available stock.
        """
        # Arrange - Try to sell more than we have
        quantity_to_sell = sample_medicine.inventory.quantity + 10

        sale_data = {
            "client_id": sample_client.id,
            "user_id": sample_user.id,
            "items": [
                {
                    "medicine_id": sample_medicine.id,
                    "quantity": quantity_to_sell,
                    "unit_price": sample_medicine.sale_price,
                }
            ],
        }

        # Act
        response = client.post("/api/v1/sales/", json=sale_data)

        # Assert - Should fail with 400 Bad Request
        assert response.status_code == 400, (
            f"Expected 400 for insufficient stock, got {response.status_code}"
        )

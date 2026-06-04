import hashlib
import unittest
from unittest.mock import patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from database import get_db
from routers import payments


class FakeDb:
    async def scalar(self, statement):
        return None


class TinkoffWebhookTests(unittest.TestCase):
    def make_client(self):
        app = FastAPI()
        app.include_router(payments.router, prefix="/payments")

        async def override_db():
            yield FakeDb()

        app.dependency_overrides[get_db] = override_db
        return TestClient(app)

    def test_signs_all_scalar_root_fields(self):
        payload = {
            "Amount": 1000,
            "Success": True,
            "Token": "ignored",
            "ExtraProviderField": "extra",
            "Data": {"ignored": "nested"},
            "Nullable": None,
        }

        with patch.object(payments, "TINKOFF_SECRET", "secret"):
            signature = payments.tinkoff_sign(payload)

        expected_values = "1000extrasecrettrue"
        expected = hashlib.sha256(expected_values.encode()).hexdigest()
        self.assertEqual(signature, expected)

    def test_acknowledges_valid_notification_with_plain_text_ok(self):
        payload = {
            "TerminalKey": "terminal",
            "OrderId": "order-1",
            "PaymentId": "payment-1",
            "Status": "CONFIRMED",
            "Amount": 1000,
            "Success": True,
            "ErrorCode": "0",
        }

        with patch.object(payments, "TINKOFF_SECRET", "secret"):
            payload["Token"] = payments.tinkoff_sign(payload)
            response = self.make_client().post("/payments/tinkoff/webhook", json=payload)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.text, "OK")
        self.assertTrue(response.headers["content-type"].startswith("text/plain"))

    def test_rejects_invalid_notification_signature(self):
        payload = {
            "TerminalKey": "terminal",
            "OrderId": "order-1",
            "PaymentId": "payment-1",
            "Status": "CONFIRMED",
            "Amount": 1000,
            "Token": "invalid",
        }

        response = self.make_client().post("/payments/tinkoff/webhook", json=payload)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {"detail": "Invalid signature"})


if __name__ == "__main__":
    unittest.main()

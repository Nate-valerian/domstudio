import hashlib
import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from database import get_db
from routers import payments


class FakeDb:
    def __init__(self, payment=None):
        self.payment = payment

    async def scalar(self, statement):
        return self.payment

    async def execute(self, statement):
        if not self.payment:
            return SimpleNamespace(first=lambda: None)

        self.payment.status = payments.PaymentStatus.succeeded
        row = SimpleNamespace(
            id=getattr(self.payment, "id", None),
            user_id=self.payment.user_id,
            plan=getattr(self.payment, "plan", None),
            pack_id=getattr(self.payment, "pack_id", None),
        )
        return SimpleNamespace(first=lambda: row)


class TinkoffWebhookTests(unittest.TestCase):
    def make_client(self, payment=None):
        app = FastAPI()
        app.include_router(payments.router, prefix="/payments")
        db = FakeDb(payment)

        async def override_db():
            yield db

        app.dependency_overrides[get_db] = override_db
        return TestClient(app), db

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
            client, _ = self.make_client()
            response = client.post("/payments/tinkoff/webhook", json=payload)

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

        client, _ = self.make_client()
        response = client.post("/payments/tinkoff/webhook", json=payload)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {"detail": "Invalid signature"})

    def test_activates_subscription_before_acknowledging_payment(self):
        payment = SimpleNamespace(
            status=payments.PaymentStatus.pending,
            user_id=uuid.uuid4(),
            plan=payments.PlanName.pro,
        )
        payload = {
            "TerminalKey": "terminal",
            "OrderId": "order-1",
            "PaymentId": "payment-1",
            "Status": "CONFIRMED",
            "Amount": 1000,
        }

        with (
            patch.object(payments, "TINKOFF_SECRET", "secret"),
            patch.object(payments, "activate_subscription", new_callable=AsyncMock) as activate,
        ):
            payload["Token"] = payments.tinkoff_sign(payload)
            client, db = self.make_client(payment)
            response = client.post("/payments/tinkoff/webhook", json=payload)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(payment.status, payments.PaymentStatus.succeeded)
        activate.assert_awaited_once_with(payment.user_id, payment.plan, db)


if __name__ == "__main__":
    unittest.main()

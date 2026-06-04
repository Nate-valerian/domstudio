import unittest
import uuid
from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.testclient import TestClient

from database import get_db
from dependencies import get_current_user
from routers.tokens import router


class FakeResult:
    def __init__(self, balance):
        self.balance = balance

    def scalar_one_or_none(self):
        return self.balance


class FakeDb:
    def __init__(self, balance):
        self.balance = balance
        self.statement = None

    async def execute(self, statement):
        self.statement = statement
        return FakeResult(self.balance)


class TokenDeductionTests(unittest.TestCase):
    def make_client(self, balance=75):
        app = FastAPI()
        app.include_router(router, prefix="/tokens")
        db = FakeDb(balance)
        user = SimpleNamespace(id=uuid.uuid4())

        async def override_db():
            yield db

        async def override_user():
            return user

        app.dependency_overrides[get_db] = override_db
        app.dependency_overrides[get_current_user] = override_user
        return TestClient(app), db

    def test_rejects_non_positive_amount(self):
        client, db = self.make_client()

        response = client.post("/tokens/deduct", params={"amount": -100})

        self.assertEqual(response.status_code, 422)
        self.assertIsNone(db.statement)

    def test_deducts_with_single_atomic_update(self):
        client, db = self.make_client(balance=75)

        response = client.post("/tokens/deduct", params={"amount": 25})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"balance": 75, "deducted": 25})
        statement = str(db.statement)
        self.assertIn("UPDATE token_balances", statement)
        self.assertIn("token_balances.balance >=", statement)
        self.assertIn("token_balances.balance -", statement)

    def test_returns_payment_required_when_balance_cannot_be_deducted(self):
        client, _ = self.make_client(balance=None)

        response = client.post("/tokens/deduct", params={"amount": 25})

        self.assertEqual(response.status_code, 402)
        self.assertEqual(response.json(), {"detail": "Insufficient tokens"})


if __name__ == "__main__":
    unittest.main()

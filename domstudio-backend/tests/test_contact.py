import unittest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from routers import contact


class ContactRouterTests(unittest.TestCase):
    def test_contact_endpoint_accepts_valid_payload(self):
        from fastapi import FastAPI

        app = FastAPI()
        app.include_router(contact.router, prefix="/contact")

        with patch.object(contact, "send_contact_message", new=AsyncMock()) as send_mock:
            response = TestClient(app).post(
                "/contact",
                json={
                    "email": "seller@example.com",
                    "reason": "help",
                    "message": "I need help with my DomStudio account.",
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"ok": True})
        send_mock.assert_awaited_once()

    def test_contact_endpoint_rejects_short_message(self):
        from fastapi import FastAPI

        app = FastAPI()
        app.include_router(contact.router, prefix="/contact")

        response = TestClient(app).post(
            "/contact",
            json={"email": "seller@example.com", "reason": "help", "message": "short"},
        )

        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()

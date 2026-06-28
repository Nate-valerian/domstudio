import unittest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from routers import ad_chat


class AdChatRouterTests(unittest.TestCase):
    def setUp(self):
        ad_chat._chat_hits.clear()

    def test_chat_endpoint_accepts_valid_payload(self):
        from fastapi import FastAPI

        app = FastAPI()
        app.include_router(ad_chat.router, prefix="/ad-chat")

        with patch.object(ad_chat, "ask_text_ai", new=AsyncMock(return_value=("Try this listing title.", None))) as ask_mock:
            response = TestClient(app).post(
                "/ad-chat",
                json={
                    "language": "en",
                    "product": "leather boots",
                    "messages": [{"role": "user", "content": "Give me an Avito title"}],
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["reply"], "Try this listing title.")
        self.assertEqual(response.json()["provider"], "text-ai")
        ask_mock.assert_awaited_once()

    def test_chat_endpoint_rejects_empty_messages(self):
        from fastapi import FastAPI

        app = FastAPI()
        app.include_router(ad_chat.router, prefix="/ad-chat")

        response = TestClient(app).post("/ad-chat", json={"language": "en", "messages": []})

        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()

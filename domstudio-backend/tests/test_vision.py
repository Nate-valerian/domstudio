import base64
import os
import unittest
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from routers import vision


TEST_IMAGE = "data:image/jpeg;base64," + base64.b64encode(b"small-test-image").decode("ascii")


class FakeGroqResponse:
    is_success = True
    status_code = 200

    def json(self):
        return {"choices": [{"message": {"content": "Product: orange travel bottle"}}]}


class FakeGroqClient:
    def __init__(self):
        self.request = None

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, traceback):
        return None

    async def post(self, url, **kwargs):
        self.request = {"url": url, **kwargs}
        return FakeGroqResponse()


class VisionRouterTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        vision._vision_hits.clear()

    async def test_builds_groq_multimodal_request(self):
        fake_client = FakeGroqClient()
        request = vision.VisionAnalyzeRequest(
            image_data=TEST_IMAGE,
            language="en",
            product_context="Reusable bottle",
        )

        with patch.dict(os.environ, {"GROQ_API_KEY": "test-key"}, clear=False):
            with patch.object(vision.httpx, "AsyncClient", return_value=fake_client):
                analysis, model = await vision.analyze_with_groq(request)

        self.assertEqual(analysis, "Product: orange travel bottle")
        self.assertEqual(model, vision.DEFAULT_GROQ_VISION_MODEL)
        self.assertEqual(fake_client.request["url"], "https://api.groq.com/openai/v1/chat/completions")
        payload = fake_client.request["json"]
        self.assertEqual(payload["model"], vision.DEFAULT_GROQ_VISION_MODEL)
        self.assertEqual(payload["reasoning_effort"], "none")
        self.assertEqual(payload["reasoning_format"], "hidden")
        content = payload["messages"][0]["content"]
        self.assertIn("Reusable bottle", content[0]["text"])
        self.assertEqual(content[1]["image_url"]["url"], TEST_IMAGE)
        self.assertEqual(fake_client.request["headers"]["Authorization"], "Bearer test-key")

    async def test_endpoint_returns_analysis_without_exposing_key(self):
        app = FastAPI()
        app.include_router(vision.router, prefix="/vision")

        with patch.dict(os.environ, {"GROQ_API_KEY": "test-key"}, clear=False):
            with patch.object(
                vision,
                "analyze_with_groq",
                new=AsyncMock(return_value=("Product: leather bag", vision.DEFAULT_GROQ_VISION_MODEL)),
            ):
                response = TestClient(app).post(
                    "/vision/analyze",
                    json={"image_data": TEST_IMAGE, "language": "en", "product_context": "bag"},
                )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["analysis"], "Product: leather bag")
        self.assertEqual(response.json()["provider"], "groq")
        self.assertNotIn("test-key", response.text)

    async def test_rejects_non_image_data_url(self):
        app = FastAPI()
        app.include_router(vision.router, prefix="/vision")

        with patch.dict(os.environ, {"GROQ_API_KEY": "test-key"}, clear=False):
            response = TestClient(app).post(
                "/vision/analyze",
                json={"image_data": "https://example.com/product.jpg", "language": "en"},
            )

        self.assertEqual(response.status_code, 422)

    async def test_health_reports_missing_configuration(self):
        with patch.dict(os.environ, {"GROQ_API_KEY": ""}, clear=False):
            result = await vision.vision_health()

        self.assertFalse(result["configured"])
        self.assertEqual(result["provider"], "groq")

    async def test_removes_reasoning_if_provider_includes_it(self):
        cleaned = vision._clean_analysis("<think>private reasoning</think>\nProduct: bottle")

        self.assertEqual(cleaned, "Product: bottle")


if __name__ == "__main__":
    unittest.main()

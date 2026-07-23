import os
import unittest
from unittest.mock import patch

from services import text_ai


class FakeResponse:
    def __init__(self, status_code, content=""):
        self.status_code = status_code
        self.is_success = 200 <= status_code < 300
        self._content = content

    def json(self):
        return {"choices": [{"message": {"content": self._content}}]}


class FakeClient:
    def __init__(self, responses, requests):
        self.responses = iter(responses)
        self.requests = requests

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def post(self, url, **kwargs):
        self.requests.append({"url": url, **kwargs})
        return next(self.responses)


class TextAiFallbackTests(unittest.IsolatedAsyncioTestCase):
    async def test_uses_deepseek_when_groq_primary_is_rate_limited(self):
        requests = []
        fake_client = FakeClient(
            [FakeResponse(429), FakeResponse(200, "DeepSeek fallback copy")],
            requests,
        )
        env = {
            "TEXT_AI_BASE_URL": "https://api.groq.com/openai/v1",
            "TEXT_AI_MODEL": "qwen/qwen3.6-27b",
            "TEXT_AI_API_KEY": "",
            "GROQ_API_KEY": "groq-secret",
            "DEEPSEEK_API_KEY": "deepseek-secret",
            "DEEPSEEK_MODEL": "deepseek-v4-flash",
        }

        with patch.dict(os.environ, env, clear=True):
            with patch.object(text_ai.httpx, "AsyncClient", return_value=fake_client):
                output, provider, warning = await text_ai.complete_with_fallback(
                    [{"role": "user", "content": "Write a listing"}],
                    temperature=0.7,
                    max_tokens=500,
                    timeout_ms=1000,
                )

        self.assertEqual(output, "DeepSeek fallback copy")
        self.assertEqual(provider, "deepseek")
        self.assertIn("groq HTTP 429", warning)
        self.assertEqual(requests[0]["url"], "https://api.groq.com/openai/v1/chat/completions")
        self.assertEqual(requests[1]["url"], "https://api.deepseek.com/chat/completions")
        self.assertEqual(requests[0]["headers"]["Authorization"], "Bearer groq-secret")
        self.assertEqual(requests[1]["headers"]["Authorization"], "Bearer deepseek-secret")
        self.assertEqual(requests[1]["json"]["thinking"], {"type": "disabled"})

    async def test_uses_existing_groq_vision_config_as_text_primary(self):
        env = {
            "GROQ_API_KEY": "groq-secret",
            "GROQ_VISION_BASE_URL": "https://api.groq.com/openai/v1",
            "GROQ_VISION_MODEL": "qwen/qwen3.6-27b",
            "DEEPSEEK_API_KEY": "deepseek-secret",
        }

        with patch.dict(os.environ, env, clear=True):
            providers = text_ai.configured_text_providers()

        self.assertEqual([provider.name for provider in providers], ["groq", "deepseek"])
        self.assertEqual(providers[0].model, "qwen/qwen3.6-27b")
        self.assertEqual(providers[1].model, "deepseek-v4-flash")

    async def test_reports_failure_after_every_provider_fails(self):
        requests = []
        fake_client = FakeClient([FakeResponse(503), FakeResponse(402)], requests)
        env = {
            "TEXT_AI_BASE_URL": "https://api.groq.com/openai/v1",
            "TEXT_AI_MODEL": "qwen/qwen3.6-27b",
            "TEXT_AI_API_KEY": "groq-secret",
            "DEEPSEEK_API_KEY": "deepseek-secret",
        }

        with patch.dict(os.environ, env, clear=True):
            with patch.object(text_ai.httpx, "AsyncClient", return_value=fake_client):
                output, provider, warning = await text_ai.complete_with_fallback(
                    [{"role": "user", "content": "Write a listing"}],
                    temperature=0.7,
                    max_tokens=500,
                    timeout_ms=1000,
                )

        self.assertEqual(output, "")
        self.assertIsNone(provider)
        self.assertIn("groq HTTP 503", warning)
        self.assertIn("deepseek HTTP 402", warning)


if __name__ == "__main__":
    unittest.main()

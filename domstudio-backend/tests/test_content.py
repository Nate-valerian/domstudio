import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

from routers import content


class FakeResult:
    def __init__(self, value):
        self.value = value

    def scalar_one_or_none(self):
        return self.value


class FakeDb:
    def __init__(self, results):
        self.results = iter(results)
        self.statements = []
        self.added = []

    async def execute(self, statement):
        self.statements.append(statement)
        return FakeResult(next(self.results))

    def add(self, item):
        if getattr(item, "id", None) is None:
            item.id = uuid.uuid4()
        self.added.append(item)

    async def flush(self):
        return None


class ContentGenerationTests(unittest.IsolatedAsyncioTestCase):
    async def test_lists_adpilot_tools(self):
        result = await content.list_tools()

        slugs = [tool["slug"] for tool in result["tools"]]
        self.assertIn("avito-ad", slugs)
        self.assertIn("ozon-wb-card", slugs)
        self.assertEqual(result["token_unit"], content.CONTENT_TOKEN_UNIT)

    async def test_generates_with_local_fallback_and_refunds_tokens(self):
        db = FakeDb([490, 500])
        user = SimpleNamespace(id=uuid.uuid4())

        async def no_backend(prompt):
            self.assertIn("Language: English", prompt)
            return "", None, "not configured"

        with patch.object(content, "generate_with_text_backend", no_backend):
            result = await content.generate_content(
                content.ContentGenerateRequest(
                    tool_slug="avito-reply",
                    input={
                        "product": "Brake pad replacement",
                        "price": "4500 RUB",
                        "city": "Moscow",
                        "customerQuestion": "Available today?",
                    },
                    profile={"businessName": "Pilot Auto"},
                ),
                db,
                user,
            )

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["provider"], "local-template")
        self.assertIn("No tokens charged", result["warning"])
        self.assertEqual(result["tokens_charged"], 0)
        self.assertEqual(result["token_balance"], 500)
        self.assertEqual(result["output_language"], "English")
        self.assertIn("Hi! Yes, Brake pad replacement is available.", result["output"])
        self.assertEqual(len(db.added), 1)
        self.assertEqual(db.added[0].mode, "content:avito-reply")
        self.assertEqual(db.added[0].output_format, "text")
        self.assertEqual(db.added[0].tokens_used, 0)

    async def test_generates_with_text_ai_provider_when_available(self):
        db = FakeDb([480])
        user = SimpleNamespace(id=uuid.uuid4())

        async def fake_backend(prompt):
            self.assertIn("Yandex Ads", prompt)
            self.assertIn("Language: English", prompt)
            return "AI output", "groq", None

        with patch.object(content, "generate_with_text_backend", fake_backend):
            result = await content.generate_content(
                content.ContentGenerateRequest(
                    tool_slug="yandex-ads",
                    input={"product": "Car detailing"},
                    profile={},
                    output_language="english",
                ),
                db,
                user,
            )

        self.assertEqual(result["provider"], "groq")
        self.assertEqual(result["output"], "AI output")
        self.assertEqual(result["tokens_charged"], 20)
        self.assertEqual(result["output_language"], "English")

    async def test_local_fallback_can_generate_russian(self):
        db = FakeDb([490, 500])
        user = SimpleNamespace(id=uuid.uuid4())

        async def no_backend(prompt):
            self.assertIn("Language: Russian", prompt)
            return "", None, "not configured"

        with patch.object(content, "generate_with_text_backend", no_backend):
            result = await content.generate_content(
                content.ContentGenerateRequest(
                    tool_slug="price-objection",
                    input={
                        "product": "замена тормозных колодок",
                        "price": "от 4 500 ₽",
                        "advantages": "гарантия, быстрый ответ",
                        "customerQuestion": "Можно дешевле?",
                    },
                    profile={},
                    output_language="auto",
                ),
                db,
                user,
            )

        self.assertEqual(result["output_language"], "Russian")
        self.assertIn("Понимаю, цена важна.", result["output"])
        self.assertEqual(result["tokens_charged"], 0)
        self.assertEqual(result["token_balance"], 500)

    async def test_rejects_unknown_tool(self):
        db = FakeDb([])
        user = SimpleNamespace(id=uuid.uuid4())

        with self.assertRaises(HTTPException) as raised:
            await content.generate_content(
                content.ContentGenerateRequest(tool_slug="missing", input={}, profile={}),
                db,
                user,
            )

        self.assertEqual(raised.exception.status_code, 400)
        self.assertEqual(raised.exception.detail, "Unknown content tool")
        self.assertEqual(len(db.added), 0)

    async def test_rejects_when_balance_is_insufficient(self):
        db = FakeDb([None])
        user = SimpleNamespace(id=uuid.uuid4())

        with self.assertRaises(HTTPException) as raised:
            await content.generate_content(
                content.ContentGenerateRequest(tool_slug="landing-page", input={}, profile={}),
                db,
                user,
            )

        self.assertEqual(raised.exception.status_code, 402)
        self.assertEqual(raised.exception.detail, "Insufficient tokens")
        self.assertEqual(len(db.added), 0)


if __name__ == "__main__":
    unittest.main()

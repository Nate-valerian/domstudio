import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

from routers import generation


class FakeResult:
    def __init__(self, value):
        self.value = value

    def scalar_one_or_none(self):
        return self.value


class FakeDb:
    def __init__(self, results):
        self.results = iter(results)
        self.statements = []

    async def execute(self, statement):
        self.statements.append(statement)
        return FakeResult(next(self.results))


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def raise_for_status(self):
        return None

    def json(self):
        return self.payload


class FakeClient:
    payload = {"status": "success", "image": "base64", "format": "PNG"}

    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        return None

    async def post(self, *args, **kwargs):
        return FakeResponse(self.payload)


class GenerationTests(unittest.IsolatedAsyncioTestCase):
    async def test_charges_tokens_and_returns_worker_result(self):
        db = FakeDb([900])
        user = SimpleNamespace(id=uuid.uuid4())

        with patch.object(generation, "GENERATION_PROVIDER", "worker"):
            with patch.object(generation.httpx, "AsyncClient", FakeClient):
                result = await generation.generate(
                    generation.GenerateRequest(subject="gold earrings"),
                    db,
                    user,
                )

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["tokens_charged"], generation.GENERATION_TOKEN_COST)
        self.assertEqual(result["token_balance"], 900)
        self.assertEqual(len(db.statements), 1)

    async def test_can_use_comfy_provider(self):
        db = FakeDb([900])
        user = SimpleNamespace(id=uuid.uuid4())

        async def fake_comfy(req):
            return {"status": "success", "image": "base64", "format": "PNG", "prompt_id": "abc"}

        with patch.object(generation, "GENERATION_PROVIDER", "comfy"):
            with patch.object(generation, "generate_image_with_comfy", fake_comfy):
                result = await generation.generate(
                    generation.GenerateRequest(subject="gold earrings"),
                    db,
                    user,
                )

        self.assertEqual(result["prompt_id"], "abc")
        self.assertEqual(result["tokens_charged"], generation.GENERATION_TOKEN_COST)
        self.assertEqual(len(db.statements), 1)

    async def test_refunds_tokens_when_worker_fails(self):
        db = FakeDb([900, 1000])
        user = SimpleNamespace(id=uuid.uuid4())
        failing_client = type("FailingClient", (FakeClient,), {
            "payload": {"status": "error", "error": "worker unavailable"},
        })

        with patch.object(generation, "GENERATION_PROVIDER", "worker"):
            with patch.object(generation.httpx, "AsyncClient", failing_client):
                with self.assertRaises(HTTPException) as raised:
                    await generation.generate(
                        generation.GenerateRequest(subject="gold earrings"),
                        db,
                        user,
                    )

        self.assertEqual(raised.exception.status_code, 502)
        self.assertEqual(len(db.statements), 2)

    async def test_rejects_generation_when_balance_is_insufficient(self):
        db = FakeDb([None])
        user = SimpleNamespace(id=uuid.uuid4())

        with self.assertRaises(HTTPException) as raised:
            await generation.generate(
                generation.GenerateRequest(subject="gold earrings"),
                db,
                user,
            )

        self.assertEqual(raised.exception.status_code, 402)


if __name__ == "__main__":
    unittest.main()

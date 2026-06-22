import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import BackgroundTasks
from fastapi import HTTPException

from routers import generation


class FakeResult:
    def __init__(self, value):
        self.value = value

    def scalar_one_or_none(self):
        return self.value

    def first(self):
        return self.value


class FakeDb:
    def __init__(self, results):
        self.results = iter(results)
        self.statements = []
        self.added = []
        self.commits = 0

    async def execute(self, statement):
        self.statements.append(statement)
        return FakeResult(next(self.results))

    def add(self, item):
        if getattr(item, "id", None) is None:
            item.id = uuid.uuid4()
        self.added.append(item)

    async def flush(self):
        return None

    async def commit(self):
        self.commits += 1


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
        db = FakeDb([(1, 5), 900])
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
        self.assertEqual(result["quota_used"], 1)
        self.assertEqual(result["quota_limit"], 5)
        self.assertEqual(len(db.statements), 2)

    async def test_can_use_comfy_provider(self):
        db = FakeDb([(1, 5), 900])
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
        self.assertEqual(len(db.statements), 2)

    async def test_refunds_tokens_when_worker_fails(self):
        db = FakeDb([(1, 5), 900, 1000, None])
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
        self.assertEqual(len(db.statements), 4)

    async def test_rejects_generation_when_balance_is_insufficient(self):
        db = FakeDb([(1, 5), None, None])
        user = SimpleNamespace(id=uuid.uuid4())

        with self.assertRaises(HTTPException) as raised:
            await generation.generate(
                generation.GenerateRequest(subject="gold earrings"),
                db,
                user,
            )

        self.assertEqual(raised.exception.status_code, 402)
        self.assertEqual(raised.exception.detail, "Insufficient tokens")
        self.assertEqual(len(db.statements), 3)

    async def test_rejects_generation_when_photo_quota_is_exhausted(self):
        db = FakeDb([None])
        user = SimpleNamespace(id=uuid.uuid4())

        with self.assertRaises(HTTPException) as raised:
            await generation.generate(
                generation.GenerateRequest(subject="gold earrings"),
                db,
                user,
            )

        self.assertEqual(raised.exception.status_code, 402)
        self.assertEqual(raised.exception.detail, "Photo quota exceeded")
        self.assertEqual(len(db.statements), 1)

    async def test_video_token_cost_is_free_for_local_and_paid_for_premium(self):
        self.assertEqual(
            generation.video_token_cost(generation.VideoRequest(subject="product", image="base64")),
            0,
        )
        self.assertEqual(
            generation.video_token_cost(
                generation.VideoRequest(subject="product", image="base64", video_provider="premium")
            ),
            generation.VIDEO_TOKEN_COST,
        )

    async def test_local_video_reserves_local_quota_without_charging_tokens(self):
        db = FakeDb([(1, 5), 500])
        user = SimpleNamespace(id=uuid.uuid4())

        result = await generation.generate_video(
            generation.VideoRequest(subject="product", image="base64", video_provider="local"),
            BackgroundTasks(),
            db,
            user,
        )

        self.assertEqual(result["tokens_charged"], 0)
        self.assertEqual(result["token_balance"], 500)
        self.assertEqual(result["quota_used"], 1)
        self.assertEqual(result["quota_limit"], 5)
        self.assertEqual(result["video_provider"], "local")
        self.assertEqual(len(db.added), 1)
        self.assertEqual(db.commits, 1)

    async def test_premium_video_reserves_premium_quota_and_charges_tokens(self):
        db = FakeDb([(1, 10), 2700])
        user = SimpleNamespace(id=uuid.uuid4())

        result = await generation.generate_video(
            generation.VideoRequest(subject="product", image="base64", video_provider="premium"),
            BackgroundTasks(),
            db,
            user,
        )

        self.assertEqual(result["tokens_charged"], generation.VIDEO_TOKEN_COST)
        self.assertEqual(result["token_balance"], 2700)
        self.assertEqual(result["quota_used"], 1)
        self.assertEqual(result["quota_limit"], 10)

    async def test_rejects_video_when_quota_is_exhausted(self):
        db = FakeDb([None])
        user = SimpleNamespace(id=uuid.uuid4())

        with self.assertRaises(HTTPException) as raised:
            await generation.generate_video(
                generation.VideoRequest(subject="product", image="base64", video_provider="local"),
                BackgroundTasks(),
                db,
                user,
            )

        self.assertEqual(raised.exception.status_code, 402)
        self.assertEqual(raised.exception.detail, "Video quota exceeded")
        self.assertEqual(len(db.added), 0)

    async def test_releases_premium_quota_when_token_charge_fails(self):
        db = FakeDb([(1, 10), None, None])
        user = SimpleNamespace(id=uuid.uuid4())

        with self.assertRaises(HTTPException) as raised:
            await generation.generate_video(
                generation.VideoRequest(subject="product", image="base64", video_provider="premium"),
                BackgroundTasks(),
                db,
                user,
            )

        self.assertEqual(raised.exception.status_code, 402)
        self.assertEqual(raised.exception.detail, "Insufficient tokens")
        self.assertEqual(len(db.statements), 3)
        self.assertEqual(len(db.added), 0)


if __name__ == "__main__":
    unittest.main()

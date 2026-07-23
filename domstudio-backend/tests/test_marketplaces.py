import unittest
import uuid
from types import SimpleNamespace

from database import MarketplaceProvider
from services.adpilot_engine import build_action_draft
from services.marketplace_integrations import (
    json_loads,
    normalize_product,
    provider_catalog,
    publish_action,
)


class MarketplaceServiceTests(unittest.IsolatedAsyncioTestCase):
    def test_provider_catalog_exposes_all_three_marketplaces(self):
        providers = {item["provider"] for item in provider_catalog()}

        self.assertEqual(providers, {"wildberries", "ozon", "avito"})

    def test_normalizes_wb_style_product_payload(self):
        product = normalize_product(
            MarketplaceProvider.wildberries,
            {
                "nmID": 123,
                "title": "Leather bag",
                "vendorCode": "BAG-1",
                "subjectName": "Bags",
                "salePrice": 4990,
                "stocks": [{"quantity": 2}, {"quantity": 3}],
                "photos": [{"url": "https://example.test/bag.jpg"}],
            },
        )

        self.assertEqual(product["external_product_id"], "123")
        self.assertEqual(product["sku"], "BAG-1")
        self.assertEqual(product["stock"], 5)
        self.assertEqual(json_loads(product["raw_payload"])["title"], "Leather bag")

    async def test_publish_action_is_dry_run_until_live_adapter_enabled(self):
        result = await publish_action(
            MarketplaceProvider.ozon,
            "draft",
            "improve_card",
            {"copy": "Better card"},
        )

        self.assertFalse(result["published"])
        self.assertTrue(result["dry_run"])

    async def test_build_action_draft_uses_local_fallback_when_ai_unavailable(self):
        product = SimpleNamespace(
            id=uuid.uuid4(),
            provider=MarketplaceProvider.avito,
            external_product_id="42",
            title="Winter tires",
            sku="TIRE-42",
            category="Auto",
            price="12000 RUB",
            stock=4,
            image_url=None,
            description="",
            raw_payload=None,
        )

        async def no_ai(prompt):
            self.assertIn("Provider: avito", prompt)
            return "", None, "offline"

        draft, provider = await build_action_draft(
            MarketplaceProvider.avito,
            "avito_listing",
            product,
            {"city": "Moscow"},
            {"businessName": "Dom Tires"},
            "english",
            no_ai,
        )

        self.assertEqual(provider, "local-template")
        self.assertEqual(draft["ai_provider"], "local-template")
        self.assertIn("Winter tires", draft["copy"])


if __name__ == "__main__":
    unittest.main()

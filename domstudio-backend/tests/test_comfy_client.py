import unittest
from types import SimpleNamespace
from unittest.mock import patch

from services import comfy_client


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def raise_for_status(self):
        return None

    def json(self):
        return self.payload


class FakeAutoDlClient:
    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        return None

    async def post(self, *args, **kwargs):
        return FakeResponse({
            "data": {
                "list": [
                    {"info": {"status": "stopped", "service_6006_port_url": "https://stopped.example"}},
                    {"info": {"status": "running", "service_6006_port_url": "https://running.example"}},
                ]
            }
        })


class ComfyClientTests(unittest.IsolatedAsyncioTestCase):
    async def test_discovers_running_autodl_service_url(self):
        with patch.object(comfy_client.httpx, "AsyncClient", FakeAutoDlClient):
            url = await comfy_client.discover_autodl_comfy_url(
                token="token",
                deployment_uuid="deployment",
                port=6006,
            )

        self.assertEqual(url, "https://running.example")

    async def test_render_workflow_replaces_placeholders_with_typed_values(self):
        workflow = {
            "node": {
                "inputs": {
                    "prompt": "{{prompt}}",
                    "seed": "{{seed}}",
                    "upscale": "{{upscale_4k}}",
                    "mode": "mode={{mode}}",
                }
            }
        }
        request = SimpleNamespace(
            subject="gold earrings",
            style_hint="clean catalog",
            seed=42,
            image=None,
            upscale_4k=True,
            mode="catalog",
        )

        rendered = comfy_client.render_workflow(workflow, request)

        inputs = rendered["node"]["inputs"]
        self.assertEqual(inputs["prompt"], "gold earrings, clean catalog")
        self.assertEqual(inputs["seed"], 42)
        self.assertIs(inputs["upscale"], True)
        self.assertEqual(inputs["mode"], "mode=catalog")

    async def test_extracts_image_outputs_from_history_payload(self):
        outputs = comfy_client._extract_outputs({
            "outputs": {
                "9": {
                    "images": [
                        {"filename": "result.png", "subfolder": "", "type": "output"}
                    ]
                }
            }
        })

        self.assertEqual(outputs[0]["filename"], "result.png")
        self.assertEqual(outputs[0]["kind"], "images")


if __name__ == "__main__":
    unittest.main()

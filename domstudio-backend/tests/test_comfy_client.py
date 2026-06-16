import unittest
from types import SimpleNamespace
from unittest.mock import patch

import httpx

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


class FakeComfyRunner:
    last_workflow = None

    def __init__(self, *args, **kwargs):
        pass

    async def upload_image(self, image_b64):
        return "uploaded-product.jpg"

    async def run_workflow(self, workflow):
        FakeComfyRunner.last_workflow = workflow
        return {"status": "success", "image": "base64", "format": "PNG"}


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

    async def test_img2img_fallback_corrects_scene_typos_and_keeps_props(self):
        prompt = comfy_client.compose_img2img_prompt(
            "on marbel tabel with candels.",
            "Warm light, premium minimalism",
        )

        self.assertIn("marble table with candles", prompt)
        self.assertIn("Warm light", prompt)
        self.assertIn("Include all requested scene props clearly", prompt)
        self.assertIn("Do not leave a plain white or empty studio background", prompt)
        self.assertIn("Keep the product, bottle shape, cap, color, and label exactly as they appear", prompt)

    async def test_prompt_expander_user_text_keeps_scene_and_style_context(self):
        text = comfy_client.prompt_expander_user_text(
            "on marbel tabel with candels.",
            "Warm light, premium minimalism, Website banner crop",
        )

        self.assertIn("Scene request: on marble table with candles", text)
        self.assertIn("Style context: Warm light, premium minimalism", text)

    async def test_generate_image_loads_renders_and_runs_selected_workflow(self):
        FakeComfyRunner.last_workflow = None
        request = SimpleNamespace(
            subject="marble table with candles",
            style_hint="clean catalog",
            seed=42,
            image="base64",
            upscale_4k=False,
            mode="product",
        )
        template = {
            "load": {"inputs": {"image": "{{image_name}}"}},
            "prompt": {"inputs": {"text": "{{prompt}}"}},
            "seed": {"inputs": {"value": "{{seed}}"}},
        }

        async def fake_resolve_url():
            return "https://comfy.example"

        async def fake_expand_prompt(subject, style_hint):
            return "Change the background to a marble table with candles. Keep the product exactly as it appears."

        with patch.object(comfy_client, "resolve_comfy_url", fake_resolve_url):
            with patch.object(comfy_client, "ComfyClient", FakeComfyRunner):
                with patch.object(comfy_client, "load_workflow", return_value=template) as load_workflow:
                    with patch.object(comfy_client, "expand_prompt_for_qwen", fake_expand_prompt):
                        result = await comfy_client.generate_image_with_comfy(request)

        self.assertEqual(result["status"], "success")
        load_workflow.assert_called_once_with("product_image_img2img.json")
        self.assertEqual(FakeComfyRunner.last_workflow["load"]["inputs"]["image"], "uploaded-product.jpg")
        self.assertEqual(
            FakeComfyRunner.last_workflow["prompt"]["inputs"]["text"],
            "Change the background to a marble table with candles. Keep the product exactly as it appears.",
        )
        self.assertEqual(FakeComfyRunner.last_workflow["seed"]["inputs"]["value"], 42)

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

    async def test_extracts_execution_error_from_history_payload(self):
        error = comfy_client._extract_error({
            "status": {
                "status_str": "error",
                "messages": [
                    [
                        "execution_error",
                        {
                            "node_type": "NunchakuQwenImageDiTLoader",
                            "exception_message": "Please use int4 quantization",
                        },
                    ]
                ],
            }
        })

        self.assertEqual(
            error,
            "NunchakuQwenImageDiTLoader: Please use int4 quantization",
        )

    async def test_formats_prompt_validation_errors(self):
        response = httpx.Response(
            400,
            json={
                "node_errors": {
                    "1": {
                        "class_type": "NunchakuQwenImageDiTLoader",
                        "errors": [
                            {
                                "details": "model_name: missing.safetensors not in []",
                            }
                        ],
                    }
                }
            },
        )

        self.assertEqual(
            comfy_client._response_error(response),
            "NunchakuQwenImageDiTLoader: model_name: missing.safetensors not in []",
        )


if __name__ == "__main__":
    unittest.main()

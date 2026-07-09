import unittest
from types import SimpleNamespace
from unittest.mock import patch
from tempfile import TemporaryDirectory
from pathlib import Path

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


class FakePromptClient:
    last_json = None

    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        return None

    async def post(self, *args, **kwargs):
        FakePromptClient.last_json = kwargs.get("json")
        return httpx.Response(200, json={"prompt_id": "prompt-123"})


class ComfyClientTests(unittest.IsolatedAsyncioTestCase):
    async def test_discovers_running_autodl_service_url(self):
        with patch.object(comfy_client.httpx, "AsyncClient", FakeAutoDlClient):
            url = await comfy_client.discover_autodl_comfy_url(
                token="token",
                deployment_uuid="deployment",
                port=6006,
            )

        self.assertEqual(url, "https://running.example")

    async def test_repo_comfy_url_file_overrides_stale_env_url(self):
        with TemporaryDirectory() as tmpdir:
            url_file = Path(tmpdir) / "comfy_url.txt"
            url_file.write_text("https://fresh.example\n", encoding="utf-8")

            with patch.dict(
                "os.environ",
                {
                    "COMFYUI_URL": "https://stale.example",
                    "COMFYUI_URL_FILE": str(url_file),
                },
                clear=True,
            ):
                url = await comfy_client.resolve_comfy_url()

        self.assertEqual(url, "https://fresh.example")

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

    async def test_queue_prompt_passes_comfy_account_api_key_as_extra_data(self):
        FakePromptClient.last_json = None
        client = comfy_client.ComfyClient("https://comfy.example")

        with patch.dict("os.environ", {"COMFYUI_ACCOUNT_API_KEY": "comfyui-test-key"}):
            with patch.object(comfy_client.httpx, "AsyncClient", FakePromptClient):
                prompt_id = await client.queue_prompt({"1": {"class_type": "Test", "inputs": {}}})

        self.assertEqual(prompt_id, "prompt-123")
        self.assertEqual(
            FakePromptClient.last_json["extra_data"],
            {"api_key_comfy_org": "comfyui-test-key"},
        )

    async def test_queue_prompt_blocks_paid_partner_nodes_unless_explicitly_allowed(self):
        client = comfy_client.ComfyClient("https://comfy.example")
        workflow = {"1": {"class_type": "ByteDanceImageToVideoNode", "inputs": {}}}

        with patch.dict("os.environ", {}, clear=True):
            with self.assertRaises(comfy_client.ComfyGenerationError) as raised:
                await client.queue_prompt(workflow)

        self.assertIn("COMFYUI_ALLOW_PAID_PARTNER_NODES=true", str(raised.exception))

    async def test_queue_prompt_allows_paid_partner_nodes_when_enabled(self):
        FakePromptClient.last_json = None
        client = comfy_client.ComfyClient("https://comfy.example")
        workflow = {"1": {"class_type": "ByteDanceImageToVideoNode", "inputs": {}}}

        with patch.dict("os.environ", {"COMFYUI_ALLOW_PAID_PARTNER_NODES": "true"}):
            with patch.object(comfy_client.httpx, "AsyncClient", FakePromptClient):
                prompt_id = await client.queue_prompt(workflow)

        self.assertEqual(prompt_id, "prompt-123")
        self.assertEqual(FakePromptClient.last_json["prompt"], workflow)

    async def test_video_frame_count_uses_wan_cadence(self):
        self.assertEqual(comfy_client.video_num_frames(5, 16), 81)
        self.assertEqual(comfy_client.video_num_frames(3, 16), 49)

    async def test_video_workflow_selection_supports_local_and_premium(self):
        with patch.dict("os.environ", {}, clear=True):
            self.assertEqual(
                comfy_client.video_workflow_for_request(SimpleNamespace(video_provider="local")),
                "product_video_wan_local.json",
            )
            self.assertEqual(
                comfy_client.video_workflow_for_request(SimpleNamespace(video_provider="premium")),
                "product_video.json",
            )

        with patch.dict("os.environ", {"COMFYUI_PREMIUM_VIDEO_WORKFLOW": "premium_custom.json"}):
            self.assertEqual(
                comfy_client.video_workflow_for_request(SimpleNamespace(video_provider="premium")),
                "premium_custom.json",
            )

    async def test_img2img_fallback_corrects_scene_typos_and_keeps_props(self):
        prompt = comfy_client.compose_img2img_prompt(
            "ON THE MABEL TABEL WITH CANDELS.",
            "Warm light, premium minimalism",
            "product",
        )

        self.assertIn("marble table with candles", prompt)
        self.assertIn("Product photography objective", prompt)
        self.assertIn("Warm light", prompt)
        self.assertIn("Replace the original background completely", prompt)
        self.assertIn("Include all requested scene props clearly", prompt)
        self.assertIn("visible lit candles", prompt)
        self.assertIn("clearly visible marble tabletop", prompt)
        self.assertIn("Do not leave a plain white, empty, or catalog-cutout background", prompt)
        self.assertIn("Preserve the uploaded product exactly", prompt)
        self.assertIn("Do not translate, rewrite, invent, replace, simplify, or remove existing packaging text", prompt)

    async def test_non_catalog_modes_have_distinct_prompt_objectives(self):
        expectations = {
            "product": "Product photography objective",
            "creative": "Creative campaign objective",
            "image": "Lifestyle objective",
            "fitting": "Virtual fitting objective",
            "mobile": "Stories objective",
        }

        for mode, expected in expectations.items():
            with self.subTest(mode=mode):
                prompt = comfy_client.compose_img2img_prompt("simple scene", "", mode)
                self.assertIn(expected, prompt)

    async def test_fitting_prompt_uses_items_as_wardrobe_references(self):
        prompt = comfy_client.compose_img2img_prompt(
            "loft studio with a realistic full body model",
            "premium ecommerce fashion photography",
            "fitting",
        )

        self.assertIn("Use the uploaded clothing, footwear, jewelry, or accessories as wardrobe references", prompt)
        self.assertIn("worn naturally by a realistic model", prompt)
        self.assertIn("Do not show a product pile", prompt)
        self.assertNotIn("Preserve the uploaded product exactly", prompt)

    async def test_fitting_dimensions_are_portrait(self):
        self.assertEqual(comfy_client.generation_dimensions("fitting"), (896, 1152))
        self.assertEqual(comfy_client.video_aspect_ratio("fitting"), "9:16")

    async def test_prompt_expander_user_text_keeps_scene_and_style_context(self):
        text = comfy_client.prompt_expander_user_text(
            "ON THE MABEL TABEL WITH CANDELS.",
            "Warm light, premium minimalism, Website banner crop",
            "mobile",
        )

        self.assertIn("Scene request: on the marble table with candles", text)
        self.assertIn("Mode objective: Stories objective", text)
        self.assertIn("Style context: Warm light, premium minimalism", text)

    async def test_image_edit_style_sanitizer_removes_conflicting_label_rules(self):
        text = comfy_client.sanitize_style_hint_for_image_edit(
            "Wildberries-ready, no text, no logos, crop-safe, preserve label, text overlay"
        )

        self.assertIn("Wildberries-ready", text)
        self.assertIn("crop-safe", text)
        self.assertIn("preserve label", text)
        self.assertNotIn("no text", text)
        self.assertNotIn("no logos", text)
        self.assertNotIn("text overlay", text)

    async def test_catalog_scene_request_switches_to_product_mode_on_backend(self):
        self.assertEqual(
            comfy_client.effective_generation_mode("catalog", "on a marble table with candles", True),
            "product",
        )
        self.assertEqual(
            comfy_client.effective_generation_mode("catalog", "simple white background", True),
            "catalog",
        )

    async def test_mode_prompt_directive_returns_empty_for_catalog_cleanup(self):
        self.assertEqual(comfy_client.mode_prompt_directive("catalog"), "")

    async def test_generation_dimensions_make_mobile_vertical(self):
        self.assertEqual(comfy_client.generation_dimensions("mobile"), (768, 1344))
        self.assertEqual(comfy_client.generation_dimensions("product"), (1024, 1024))

    async def test_render_workflow_sets_mode_dimensions(self):
        workflow = {"latent": {"inputs": {"width": "{{width}}", "height": "{{height}}"}}}
        request = SimpleNamespace(
            subject="story scene",
            style_hint="",
            seed=42,
            image="base64",
            upscale_4k=False,
            mode="mobile",
        )

        rendered = comfy_client.render_workflow(workflow, request, image_name="uploaded.jpg")

        self.assertEqual(rendered["latent"]["inputs"]["width"], 768)
        self.assertEqual(rendered["latent"]["inputs"]["height"], 1344)

    async def test_render_workflow_supports_effective_mode_and_negative_prompt(self):
        workflow = {
            "prompt": {"inputs": {"text": "{{prompt}}"}},
            "negative": {"inputs": {"text": "{{negative_prompt}}"}},
            "save": {"inputs": {"prefix": "domstudio/{{mode}}"}},
        }
        request = SimpleNamespace(
            subject="on a marble table with candles",
            style_hint="no text, no logos, warm light",
            seed=42,
            image="base64",
            upscale_4k=False,
            mode="catalog",
        )

        rendered = comfy_client.render_workflow(
            workflow,
            request,
            image_name="uploaded.jpg",
            mode_override="product",
        )

        self.assertIn("warm light", rendered["prompt"]["inputs"]["text"])
        self.assertNotIn("no text", rendered["prompt"]["inputs"]["text"])
        self.assertIn("fake label", rendered["negative"]["inputs"]["text"])
        self.assertEqual(rendered["save"]["inputs"]["prefix"], "domstudio/product")

    async def test_all_six_modes_select_expected_workflow_branch(self):
        expected_workflows = {
            "catalog": "catalog_birefnet.json",
            "product": "product_image_img2img.json",
            "creative": "product_image_img2img.json",
            "image": "product_image_img2img.json",
            "fitting": "product_image_img2img.json",
            "mobile": "product_image_img2img.json",
        }
        template = {
            "load": {"inputs": {"image": "{{image_name}}"}},
            "prompt": {"inputs": {"text": "{{prompt}}"}},
            "save": {"inputs": {"prefix": "domstudio/{{mode}}"}},
        }

        async def fake_resolve_url():
            return "https://comfy.example"

        async def fake_expand_prompt(subject, style_hint, mode=None):
            return f"Change the scene for {mode}. Keep the product exactly as it appears."

        for mode, workflow_name in expected_workflows.items():
            with self.subTest(mode=mode):
                FakeComfyRunner.last_workflow = None
                request = SimpleNamespace(
                    subject="test scene",
                    style_hint="clean commercial style",
                    seed=42,
                    image="base64",
                    upscale_4k=False,
                    mode=mode,
                )
                with patch.object(comfy_client, "resolve_comfy_url", fake_resolve_url):
                    with patch.object(comfy_client, "ComfyClient", FakeComfyRunner):
                        with patch.object(comfy_client, "load_workflow", return_value=template) as load_workflow:
                            with patch.object(comfy_client, "expand_prompt_for_qwen", fake_expand_prompt):
                                result = await comfy_client.generate_image_with_comfy(request)

                self.assertEqual(result["status"], "success")
                load_workflow.assert_called_once_with(workflow_name)
                self.assertEqual(FakeComfyRunner.last_workflow["load"]["inputs"]["image"], "uploaded-product.jpg")
                self.assertEqual(FakeComfyRunner.last_workflow["save"]["inputs"]["prefix"], f"domstudio/{mode}")

    async def test_catalog_scene_request_selects_product_edit_workflow(self):
        FakeComfyRunner.last_workflow = None
        request = SimpleNamespace(
            subject="on a marble table with candles",
            style_hint="clean commercial style",
            seed=42,
            image="base64",
            upscale_4k=False,
            mode="catalog",
        )
        template = {
            "load": {"inputs": {"image": "{{image_name}}"}},
            "prompt": {"inputs": {"text": "{{prompt}}"}},
            "save": {"inputs": {"prefix": "domstudio/{{mode}}"}},
        }

        async def fake_resolve_url():
            return "https://comfy.example"

        async def fake_expand_prompt(subject, style_hint, mode=None):
            self.assertEqual(mode, "product")
            return "Change only the background to a marble table with candles. Keep the uploaded product exactly as it appears, including label artwork, logos, packaging text, shape, cap, material, and color."

        with patch.object(comfy_client, "resolve_comfy_url", fake_resolve_url):
            with patch.object(comfy_client, "ComfyClient", FakeComfyRunner):
                with patch.object(comfy_client, "load_workflow", return_value=template) as load_workflow:
                    with patch.object(comfy_client, "expand_prompt_for_qwen", fake_expand_prompt):
                        result = await comfy_client.generate_image_with_comfy(request)

        self.assertEqual(result["mode"], "product")
        load_workflow.assert_called_once_with("product_image_img2img.json")
        self.assertEqual(FakeComfyRunner.last_workflow["save"]["inputs"]["prefix"], "domstudio/product")

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

        async def fake_expand_prompt(subject, style_hint, mode=None):
            self.assertEqual(mode, "product")
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

    async def test_extracts_mp4_outputs_as_video_even_when_reported_as_image(self):
        outputs = comfy_client._extract_outputs({
            "outputs": {
                "3": {
                    "images": [
                        {"filename": "product_00001_.mp4", "subfolder": "domstudio/video", "type": "output"}
                    ]
                }
            }
        })

        self.assertEqual(outputs[0]["filename"], "product_00001_.mp4")
        self.assertEqual(outputs[0]["kind"], "videos")

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

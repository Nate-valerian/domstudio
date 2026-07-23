import os
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

import runtime_info


class RuntimeInfoTests(unittest.TestCase):
    def test_runtime_payload_reports_safe_comfy_config(self):
        env = {
            "GENERATION_PROVIDER": "comfy",
            "COMFYUI_URL": "https://path-preparation-emerald-answered.trycloudflare.com",
            "COMFYUI_ACCOUNT_API_KEY": "secret-comfy-key",
            "COMFYUI_API_KEY": "",
            "DATABASE_URL": "postgresql+asyncpg://user:secret@example.com/db",
            "DEEPSEEK_API_KEY": "secret-deepseek-key",
            "COMFYUI_VIDEO_WORKFLOW": "product_video.json",
            "COMFYUI_IMAGE_WORKFLOW": "product_image.json",
        }

        with TemporaryDirectory() as tmpdir:
            url_file = Path(tmpdir) / "comfy_url.txt"
            url_file.write_text("https://fresh-live.example\n", encoding="utf-8")
            env["COMFYUI_URL_FILE"] = str(url_file)

            with patch.dict(os.environ, env, clear=True):
                payload = runtime_info.runtime_version_payload()

        self.assertEqual(payload["generation"]["provider"], "comfy")
        self.assertEqual(payload["comfy"]["url_host"], "fresh-live.example")
        self.assertEqual(payload["comfy"]["url_source"], "file")
        self.assertEqual(payload["comfy"]["env_url_host"], "path-preparation-emerald-answered.trycloudflare.com")
        self.assertTrue(payload["comfy"]["account_api_key_present"])
        self.assertFalse(payload["comfy"]["api_key_present"])
        self.assertTrue(payload["integrations"]["database_url_present"])
        self.assertTrue(payload["integrations"]["deepseek_api_key_present"])
        self.assertTrue(payload["text_ai"]["deepseek_fallback_configured"])
        self.assertEqual(payload["text_ai"]["deepseek_model"], "deepseek-v4-flash")
        self.assertEqual(payload["text_ai"]["deepseek_base_url_host"], "api.deepseek.com")
        self.assertIn("http://domstudio.site", payload["cors"]["effective_origins"])
        self.assertIn("https://domstudio.site", payload["cors"]["effective_origins"])

        serialized = str(payload)
        self.assertNotIn("secret-comfy-key", serialized)
        self.assertNotIn("secret-deepseek-key", serialized)
        self.assertNotIn("user:secret", serialized)

    def test_safe_url_host_handles_empty_and_bare_hosts(self):
        self.assertIsNone(runtime_info._safe_url_host(""))
        self.assertEqual(runtime_info._safe_url_host("example.com/path"), "example.com")


if __name__ == "__main__":
    unittest.main()

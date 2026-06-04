import os
import unittest
from pathlib import Path
from unittest.mock import patch

import config


class ConfigTests(unittest.TestCase):
    def test_env_file_is_resolved_next_to_config_module(self):
        self.assertEqual(config.ENV_FILE, Path(config.__file__).with_name(".env"))

    def test_required_env_returns_configured_value(self):
        with patch.dict(os.environ, {"REQUIRED_TEST_VALUE": "configured"}):
            self.assertEqual(config.required_env("REQUIRED_TEST_VALUE"), "configured")

    def test_required_env_rejects_missing_value(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaisesRegex(RuntimeError, "MISSING_TEST_VALUE"):
                config.required_env("MISSING_TEST_VALUE")


if __name__ == "__main__":
    unittest.main()

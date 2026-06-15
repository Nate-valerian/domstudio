"""ComfyUI workflow runner with optional AutoDL URL discovery."""

from __future__ import annotations

import asyncio
import base64
import json
import logging
import os
import time
import uuid
from copy import deepcopy
from pathlib import Path
from typing import Any

import httpx

logger = logging.getLogger(__name__)


DEFAULT_AUTODL_API_URL = "https://api.autodl.com"
DEFAULT_COMFY_PORT = "6006"
DEFAULT_WORKFLOW_DIR = Path(__file__).resolve().parents[1] / "workflows"


class ComfyConfigError(RuntimeError):
    """Raised when ComfyUI is enabled but not configured."""


class ComfyGenerationError(RuntimeError):
    """Raised when ComfyUI generation fails."""


def _env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except ValueError:
        return default


def _env_float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, default))
    except ValueError:
        return default


def _headers(api_key: str | None = None) -> dict[str, str]:
    headers: dict[str, str] = {}
    if api_key:
        headers["X-API-Key"] = api_key
        if os.getenv("COMFYUI_AUTH_HEADER", "").lower() == "authorization":
            headers["Authorization"] = api_key
    return headers


async def discover_autodl_comfy_url(
    token: str | None = None,
    instance_uuid: str | None = None,
    deployment_uuid: str | None = None,
    port: str | int | None = None,
    api_url: str | None = None,
) -> str:
    """Return the AutoDL public service URL."""

    token = token or os.getenv("AUTODL_TOKEN")
    instance_uuid = instance_uuid or os.getenv("AUTODL_INSTANCE_UUID")
    deployment_uuid = deployment_uuid or os.getenv("AUTODL_DEPLOYMENT_UUID")
    port = str(port or os.getenv("COMFYUI_PORT", DEFAULT_COMFY_PORT))
    api_url = (api_url or os.getenv("AUTODL_API_URL", DEFAULT_AUTODL_API_URL)).rstrip("/")

    if not token:
        raise ComfyConfigError("AUTODL_TOKEN is required for AutoDL discovery")

    if deployment_uuid and not instance_uuid:
        return await discover_autodl_deployment_comfy_url(token, deployment_uuid, port, api_url)

    if not instance_uuid:
        raise ComfyConfigError("AUTODL_INSTANCE_UUID or AUTODL_DEPLOYMENT_UUID is required for AutoDL discovery")

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(
            f"{api_url}/api/v1/dev/instance/pro/snapshot",
            headers={"Authorization": token},
            params={"instance_uuid": instance_uuid},
        )
        response.raise_for_status()
        payload = response.json()

    if payload.get("code") != "Success":
        raise ComfyConfigError(f"AutoDL snapshot API error: {payload.get('msg') or payload}")

    data = payload.get("data") or {}
    domain_key = f"service_{port}_domain"
    domain = data.get(domain_key)
    if not domain:
        raise ComfyConfigError(
            f"AutoDL instance {instance_uuid} has no {domain_key} "
            f"(is the instance running and is port {port} exposed?)"
        )

    # domain comes as "host:8443" — always served over HTTPS by AutoDL's proxy
    return f"https://{domain}".rstrip("/")


async def discover_autodl_deployment_comfy_url(
    token: str,
    deployment_uuid: str,
    port: str,
    api_url: str,
) -> str:
    """Return the public ComfyUI URL for an AutoDL elastic deployment."""

    service_key = f"service_{port}_port_url"
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{api_url}/api/v1/dev/deployment/container/list",
            headers={"Authorization": token},
            json={"deployment_uuid": deployment_uuid},
        )
        response.raise_for_status()
        payload = response.json()

    if payload.get("code") not in (None, "Success"):
        raise ComfyConfigError(f"AutoDL deployment API error: {payload.get('msg') or payload}")

    containers = (payload.get("data") or {}).get("list") or []
    for container in containers:
        info = container.get("info") or {}
        if info.get("status") == "running" and info.get(service_key):
            return str(info[service_key]).rstrip("/")

    raise ComfyConfigError(
        f"AutoDL deployment {deployment_uuid} has no running container with {service_key}"
    )


async def resolve_comfy_url() -> str:
    """Resolve ComfyUI URL from env or AutoDL."""

    comfy_url = os.getenv("COMFYUI_URL", "").strip()
    if comfy_url:
        return comfy_url.rstrip("/")
    return await discover_autodl_comfy_url()


def workflow_path(filename: str | None = None) -> Path:
    workflow_dir = Path(os.getenv("COMFYUI_WORKFLOW_DIR", str(DEFAULT_WORKFLOW_DIR)))
    workflow_file = filename or os.getenv("COMFYUI_IMAGE_WORKFLOW", "product_image.json")
    return workflow_dir / workflow_file


def load_workflow(filename: str | None = None) -> dict[str, Any]:
    path = workflow_path(filename)
    if not path.exists():
        raise ComfyConfigError(f"ComfyUI workflow not found: {path}")
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def compose_prompt(subject: str, style_hint: str = "") -> str:
    parts = [subject.strip(), style_hint.strip()]
    return ", ".join(part for part in parts if part)


def compose_img2img_prompt(subject: str, style_hint: str = "") -> str:
    scene = subject.strip()
    style = style_hint.strip()
    instruction = f"Change the background to: {scene}."
    if style:
        instruction += f" {style}."
    instruction += " Keep the product bottle and label exactly as they appear."
    return instruction


async def expand_prompt_for_qwen(subject: str, style_hint: str = "") -> str:
    """Use DeepSeek to expand a short user prompt into a proper Qwen Image Edit instruction.
    Falls back to compose_img2img_prompt() if DEEPSEEK_API_KEY is absent or the call fails."""
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        logger.warning("DEEPSEEK_API_KEY not set — using fallback prompt")
        return compose_img2img_prompt(subject)  # no style_hint — marketplace noise confuses Qwen
    try:
        # Send only the scene description — style_hint contains marketplace noise that confuses the model
        user_text = subject.strip()
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                "https://api.deepseek.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": "deepseek-chat",
                    "max_tokens": 200,
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You write background-change prompts for the Qwen Image Edit model.\n"
                                "The user gives a short scene description in any language.\n"
                                "OUTPUT FORMAT — you must follow this exactly:\n"
                                "  Change the background to [rich scene description with surface, lighting, atmosphere]. Keep the product exactly as it appears.\n"
                                "Rules:\n"
                                "- First word of output MUST be 'Change'\n"
                                "- Last sentence MUST be 'Keep the product exactly as it appears.'\n"
                                "- 1-2 sentences only. No extra commentary. No lists.\n"
                                "Example input: marble table with candles\n"
                                "Example output: Change the background to a polished white marble surface with three lit pillar candles casting warm golden light against a dark elegant backdrop. Keep the product exactly as it appears."
                            ),
                        },
                        {"role": "user", "content": user_text},
                    ],
                },
            )
            response.raise_for_status()
            expanded = response.json()["choices"][0]["message"]["content"].strip()
            if not expanded.lower().startswith("change"):
                logger.warning("DeepSeek returned unexpected format, using fallback. Got: %s", expanded[:100])
                return compose_img2img_prompt(subject)  # no style_hint
            logger.info("DeepSeek expanded prompt: %s", expanded)
            return expanded
    except Exception as exc:
        logger.warning("DeepSeek prompt expansion failed (%s) — using fallback", exc)
        return compose_img2img_prompt(subject)  # no style_hint


def _replace_placeholders(value: Any, replacements: dict[str, Any]) -> Any:
    if isinstance(value, dict):
        return {key: _replace_placeholders(item, replacements) for key, item in value.items()}
    if isinstance(value, list):
        return [_replace_placeholders(item, replacements) for item in value]
    if isinstance(value, str):
        exact = replacements.get(value)
        if exact is not None:
            return exact
        result = value
        for placeholder, replacement in replacements.items():
            result = result.replace(placeholder, str(replacement))
        return result
    return value


def render_workflow(workflow: dict[str, Any], request: Any, image_name: str = "", expanded_prompt: str | None = None) -> dict[str, Any]:
    if expanded_prompt is not None:
        prompt = expanded_prompt
    elif image_name:
        prompt = compose_img2img_prompt(request.subject, request.style_hint)
    else:
        prompt = compose_prompt(request.subject, request.style_hint)
    seed = int(request.seed if request.seed >= 0 else time.time_ns() % (2**32))
    replacements = {
        "{{prompt}}": prompt,
        "{{subject}}": request.subject,
        "{{style_hint}}": request.style_hint,
        "{{seed}}": seed,
        "{{image_name}}": image_name,
        "{{upscale_4k}}": bool(request.upscale_4k),
        "{{mode}}": request.mode,
    }
    return _replace_placeholders(deepcopy(workflow), replacements)


def _compress_for_upload(
    image_data: bytes,
    max_dim: int = 1280,
    quality: int = 90,
) -> tuple[bytes, str, str]:
    """Resize + JPEG-compress image before tunnel upload to avoid ConnectionResetError."""
    try:
        import io
        from PIL import Image

        img = Image.open(io.BytesIO(image_data))
        if img.mode in ("RGBA", "P", "LA"):
            img = img.convert("RGB")
        elif img.mode != "RGB":
            img = img.convert("RGB")
        img.thumbnail((max_dim, max_dim), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality, optimize=True)
        return buf.getvalue(), "image/jpeg", "jpg"
    except Exception:
        return image_data, "image/png", "png"


class ComfyClient:
    """Small async client for the standard ComfyUI HTTP API."""

    def __init__(self, base_url: str, api_key: str | None = None):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key or os.getenv("COMFYUI_API_KEY")

    async def upload_image(self, image_b64: str) -> str:
        """Upload a base64-encoded image to ComfyUI and return the stored filename."""
        image_data = base64.b64decode(image_b64)
        image_data, mime, ext = _compress_for_upload(image_data)
        filename = f"upload_{uuid.uuid4().hex[:8]}.{ext}"
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                f"{self.base_url}/upload/image",
                headers=_headers(self.api_key),
                files={"image": (filename, image_data, mime)},
                data={"type": "input", "overwrite": "true"},
            )
            response.raise_for_status()
            return response.json()["name"]

    async def queue_prompt(self, workflow: dict[str, Any]) -> str:
        async with httpx.AsyncClient(timeout=_env_int("COMFYUI_REQUEST_TIMEOUT", 60)) as client:
            response = await client.post(
                f"{self.base_url}/prompt",
                headers=_headers(self.api_key),
                json={"prompt": workflow, "client_id": str(uuid.uuid4())},
            )
            if response.is_error:
                raise ComfyGenerationError(f"ComfyUI rejected workflow: {_response_error(response)}")
            payload = response.json()

        prompt_id = payload.get("prompt_id")
        if not prompt_id:
            raise ComfyGenerationError(f"ComfyUI did not return prompt_id: {payload}")
        return str(prompt_id)

    async def history(self, prompt_id: str) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=_env_int("COMFYUI_REQUEST_TIMEOUT", 60)) as client:
            response = await client.get(
                f"{self.base_url}/history/{prompt_id}",
                headers=_headers(self.api_key),
            )
            response.raise_for_status()
            return response.json()

    async def wait_for_outputs(self, prompt_id: str) -> list[dict[str, Any]]:
        timeout = _env_int("COMFYUI_POLL_TIMEOUT", 600)
        interval = _env_float("COMFYUI_POLL_INTERVAL", 2.0)
        deadline = time.monotonic() + timeout

        while time.monotonic() < deadline:
            payload = await self.history(prompt_id)
            job = payload.get(prompt_id) or payload
            error = _extract_error(job)
            if error:
                raise ComfyGenerationError(f"ComfyUI job failed: {error}")
            outputs = _extract_outputs(job)
            if outputs:
                return outputs
            await asyncio.sleep(interval)

        raise ComfyGenerationError(f"ComfyUI job timed out: {prompt_id}")

    async def download_output(self, output: dict[str, Any]) -> tuple[str, str]:
        params = {
            "filename": output["filename"],
            "subfolder": output.get("subfolder", ""),
            "type": output.get("type", "output"),
        }
        async with httpx.AsyncClient(timeout=_env_int("COMFYUI_DOWNLOAD_TIMEOUT", 120)) as client:
            response = await client.get(
                f"{self.base_url}/view",
                headers=_headers(self.api_key),
                params=params,
            )
            response.raise_for_status()
            content_type = response.headers.get("content-type", "")
            fmt = _format_from_content_type(content_type, output["filename"])
            return base64.b64encode(response.content).decode(), fmt

    async def run_workflow(self, workflow: dict[str, Any]) -> dict[str, Any]:
        prompt_id = await self.queue_prompt(workflow)
        outputs = await self.wait_for_outputs(prompt_id)
        image_output = _first_output(outputs, {"images", "image"})
        if not image_output:
            raise ComfyGenerationError("ComfyUI finished without an image output")
        image, fmt = await self.download_output(image_output)
        return {
            "status": "success",
            "image": image,
            "format": fmt.upper(),
            "prompt_id": prompt_id,
            "filename": image_output.get("filename"),
        }


def _extract_outputs(job: dict[str, Any]) -> list[dict[str, Any]]:
    outputs: list[dict[str, Any]] = []
    nodes = job.get("outputs") if isinstance(job, dict) else None
    if not isinstance(nodes, dict):
        return outputs

    for node_output in nodes.values():
        if not isinstance(node_output, dict):
            continue
        for key in ("images", "gifs", "videos"):
            for item in node_output.get(key, []) or []:
                if isinstance(item, dict) and item.get("filename"):
                    outputs.append({"kind": key, **item})
    return outputs


def _extract_error(job: dict[str, Any]) -> str | None:
    status = job.get("status") if isinstance(job, dict) else None
    if not isinstance(status, dict):
        return None

    messages = status.get("messages") or []
    for message in reversed(messages):
        if not isinstance(message, list) or len(message) < 2:
            continue
        event, payload = message[0], message[1]
        if event != "execution_error" or not isinstance(payload, dict):
            continue
        node = payload.get("node_type") or payload.get("node_id") or "unknown node"
        detail = payload.get("exception_message") or payload.get("exception_type") or "execution error"
        return f"{node}: {detail}"

    if status.get("status_str") == "error":
        return "execution error"
    return None


def _response_error(response: httpx.Response) -> str:
    try:
        payload = response.json()
    except ValueError:
        return response.text or str(response.status_code)

    node_errors = payload.get("node_errors")
    if isinstance(node_errors, dict):
        for node_id, error_info in node_errors.items():
            if not isinstance(error_info, dict):
                continue
            class_type = error_info.get("class_type") or node_id
            errors = error_info.get("errors") or []
            if errors and isinstance(errors[0], dict):
                detail = errors[0].get("details") or errors[0].get("message")
                if detail:
                    return f"{class_type}: {detail}"

    error = payload.get("error")
    if isinstance(error, dict):
        return error.get("message") or json.dumps(error)
    return json.dumps(payload)


def _first_output(outputs: list[dict[str, Any]], kinds: set[str]) -> dict[str, Any] | None:
    for output in outputs:
        if output.get("kind") in kinds:
            return output
    return outputs[0] if outputs else None


def _format_from_content_type(content_type: str, filename: str) -> str:
    if "png" in content_type:
        return "png"
    if "jpeg" in content_type or "jpg" in content_type:
        return "jpeg"
    if "webp" in content_type:
        return "webp"
    suffix = Path(filename).suffix.lower().lstrip(".")
    return suffix or "png"


async def generate_image_with_comfy(request: Any) -> dict[str, Any]:
    base_url = await resolve_comfy_url()
    client = ComfyClient(base_url)

    image_name = ""
    is_catalog = getattr(request, "mode", "") == "catalog"

    if request.image:
        image_name = await client.upload_image(request.image)
        workflow_file = "catalog_birefnet.json" if is_catalog else "product_image_img2img.json"
    else:
        workflow_file = "product_image.json"

    expanded_prompt = None
    if image_name and not is_catalog:
        expanded_prompt = await expand_prompt_for_qwen(request.subject, getattr(request, "style_hint", ""))

    workflow = render_workflow(load_workflow(workflow_file), request, image_name=image_name, expanded_prompt=expanded_prompt)
    result = await client.run_workflow(workflow)

    # Catalog BiRefNet returns RGBA — composite onto white so output is clean white-bg JPEG/PNG
    if is_catalog and request.image and result.get("status") == "success":
        result = _composite_on_white(result)

    return result


def _composite_on_white(result: dict[str, Any]) -> dict[str, Any]:
    """Composite an RGBA base64 image onto a white background and return updated result."""
    try:
        import base64
        import io
        from PIL import Image

        raw = base64.b64decode(result["image"])
        img = Image.open(io.BytesIO(raw)).convert("RGBA")
        bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
        bg.paste(img, mask=img.split()[3])
        out = bg.convert("RGB")
        buf = io.BytesIO()
        out.save(buf, format="PNG")
        result = {**result, "image": base64.b64encode(buf.getvalue()).decode(), "format": "PNG"}
    except Exception:
        pass  # if Pillow unavailable, return raw RGBA — not ideal but not a crash
    return result

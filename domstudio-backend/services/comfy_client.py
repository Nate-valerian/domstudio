"""ComfyUI workflow runner with optional AutoDL URL discovery."""

from __future__ import annotations

import asyncio
import base64
import json
import os
import time
import uuid
from copy import deepcopy
from pathlib import Path
from typing import Any

import httpx


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
    deployment_uuid: str | None = None,
    port: str | int | None = None,
    api_url: str | None = None,
) -> str:
    """Return the AutoDL public service URL for a running elastic container."""

    token = token or os.getenv("AUTODL_TOKEN")
    deployment_uuid = deployment_uuid or os.getenv("AUTODL_DEPLOYMENT_UUID")
    port = str(port or os.getenv("COMFYUI_PORT", DEFAULT_COMFY_PORT))
    api_url = (api_url or os.getenv("AUTODL_API_URL", DEFAULT_AUTODL_API_URL)).rstrip("/")

    if not token or not deployment_uuid:
        raise ComfyConfigError("AUTODL_TOKEN and AUTODL_DEPLOYMENT_UUID are required for AutoDL discovery")

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{api_url}/api/v1/dev/deployment/container/list",
            headers={"Authorization": token},
            json={"deployment_uuid": deployment_uuid},
        )
        response.raise_for_status()
        payload = response.json()

    data = payload.get("data", {})
    if isinstance(data, list):
        containers = data
    else:
        containers = data.get("list") or data.get("items") or data.get("containers") or []
    if not isinstance(containers, list):
        raise ComfyConfigError("AutoDL container list response did not include a list")

    url_key = f"service_{port}_port_url"
    for container in containers:
        info = container.get("info") or container
        status = str(info.get("status") or container.get("status") or "").lower()
        if status and status not in {"running", "success", "started"}:
            continue
        service_url = info.get(url_key)
        if service_url:
            return str(service_url).rstrip("/")

    raise ComfyConfigError(f"No running AutoDL container exposes {url_key}")


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


def render_workflow(workflow: dict[str, Any], request: Any) -> dict[str, Any]:
    prompt = compose_prompt(request.subject, request.style_hint)
    seed = int(request.seed if request.seed >= 0 else time.time_ns() % (2**32))
    replacements = {
        "{{prompt}}": prompt,
        "{{subject}}": request.subject,
        "{{style_hint}}": request.style_hint,
        "{{seed}}": seed,
        "{{image_base64}}": request.image or "",
        "{{upscale_4k}}": bool(request.upscale_4k),
        "{{mode}}": request.mode,
    }
    return _replace_placeholders(deepcopy(workflow), replacements)


class ComfyClient:
    """Small async client for the standard ComfyUI HTTP API."""

    def __init__(self, base_url: str, api_key: str | None = None):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key or os.getenv("COMFYUI_API_KEY")

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
    workflow = render_workflow(load_workflow(), request)
    client = ComfyClient(base_url)
    return await client.run_workflow(workflow)

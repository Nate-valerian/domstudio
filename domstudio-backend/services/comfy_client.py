"""ComfyUI workflow runner with optional AutoDL URL discovery."""

from __future__ import annotations

import asyncio
import base64
import json
import logging
import os
import re
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


_SCENE_TYPO_REPLACEMENTS = {
    r"\bmabel\b": "marble",
    r"\bmable\b": "marble",
    r"\bmarbel\b": "marble",
    r"\bmarbels\b": "marbles",
    r"\btabel\b": "table",
    r"\btables\b": "tables",
    r"\bcandel\b": "candle",
    r"\bcandels\b": "candles",
}

SCENE_INTENT_PATTERN = re.compile(
    r"\b("
    r"marble|marbel|mabel|mable|table|tabel|candle|candles|candel|candels|"
    r"flower|flowers|fabric|wood|stone|kitchen|bathroom|room|desk|shelf|surface|"
    r"background|boutique|restaurant|studio set|window light|warm light"
    r")\b",
    re.IGNORECASE,
)

CATALOG_BACKGROUND_PATTERN = re.compile(
    r"\b(simple|plain|clean|white|transparent|remove|removed|cutout|cut-out)\b.{0,32}\bbackground\b|"
    r"\bbackground\b.{0,32}\b(simple|plain|clean|white|transparent|remove|removed|cutout|cut-out)\b",
    re.IGNORECASE,
)

IMAGE_EDIT_PRESERVATION_DIRECTIVE = (
    "This is a background/environment edit, not a product redesign. "
    "Preserve the uploaded product exactly: silhouette, bottle or package geometry, cap, material, color, label artwork, logo, barcode, and every visible letter or symbol. "
    "Do not translate, rewrite, invent, replace, simplify, or remove existing packaging text or branding. "
    "Do not add new labels, new logos, new text overlays, or fake brand names. "
    "Only change the surrounding environment, surface, lighting, reflections, and contact shadows."
)

IMAGE_EDIT_NEGATIVE_PROMPT = (
    "low quality, blurry, distorted, warped product, changed product shape, changed label, altered packaging, "
    "rewritten label text, fake label, fake letters, gibberish text, misspelled text, translated text, extra logo, "
    "new brand name, text overlay, watermark, duplicated product, extra bottle, broken cap, deformed cap, messy background"
)


MODE_PROMPT_DIRECTIVES = {
    "product": (
        "Product photography objective: create a premium commercial product shot with realistic surface, "
        "controlled studio lighting, refined shadows, and advertising-quality composition."
    ),
    "creative": (
        "Creative campaign objective: create an expressive social media advertising visual with a bold, "
        "scroll-stopping composition while keeping the product realistic and readable."
    ),
    "image": (
        "Lifestyle objective: place the product in a natural believable environment with contextual props, "
        "human-scale realism, and warm editorial photography."
    ),
    "fitting": (
        "Virtual fitting objective: if the product is clothing, footwear, jewelry, or an accessory, show it "
        "worn naturally by a realistic model; otherwise use a styled product scene that suggests scale and use."
    ),
    "mobile": (
        "Stories objective: compose for a mobile-first vertical story crop with the product clear in the safe "
        "center area, strong foreground/background separation, and room for future text overlays. If the scene "
        "mentions props, place them visibly around the lower third or side areas so the story frame is not plain."
    ),
}


MODE_DIMENSIONS = {
    "mobile": (768, 1344),
}


def normalize_scene_text(text: str) -> str:
    scene = str(text or "").strip()
    if scene.isupper():
        scene = scene.lower()
    for pattern, replacement in _SCENE_TYPO_REPLACEMENTS.items():
        scene = re.sub(pattern, replacement, scene, flags=re.IGNORECASE)
    scene = re.sub(r"\s+", " ", scene)
    return scene.strip(" .")


def has_scene_intent(text: str) -> bool:
    value = str(text or "")
    if CATALOG_BACKGROUND_PATTERN.search(value):
        return False
    return bool(SCENE_INTENT_PATTERN.search(value))


def effective_generation_mode(mode: str | None, subject: str = "", has_image: bool = False) -> str:
    requested = str(mode or "catalog").strip().lower() or "catalog"
    if has_image and requested == "catalog" and has_scene_intent(subject):
        return "product"
    return requested


def sanitize_style_hint_for_image_edit(style_hint: str = "") -> str:
    """Remove style phrases that fight product/label preservation."""
    raw = str(style_hint or "").strip()
    if not raw:
        return ""

    blocked = re.compile(
        r"\b(no|without|remove|avoid)\s+(visible\s+)?(text|logos?|labels?|branding)\b|"
        r"\b(no|without|remove|avoid)\s+(product\s+)?(text|logos?|labels?|branding)\b|"
        r"\btext\s*overlay\b|"
        r"\blogo\s*artifacts?\b",
        re.IGNORECASE,
    )
    parts = [part.strip(" ,") for part in re.split(r",\s*", raw) if part.strip(" ,")]
    kept = [part for part in parts if not blocked.search(part)]
    return ", ".join(kept)


def mode_prompt_directive(mode: str | None) -> str:
    return MODE_PROMPT_DIRECTIVES.get(str(mode or "").strip().lower(), "")


def generation_dimensions(mode: str | None) -> tuple[int, int]:
    return MODE_DIMENSIONS.get(str(mode or "").strip().lower(), (1024, 1024))


def video_aspect_ratio(mode: str | None) -> str:
    return "9:16" if str(mode or "").strip().lower() == "mobile" else "1:1"


def compose_img2img_prompt(subject: str, style_hint: str = "", mode: str | None = None) -> str:
    scene = normalize_scene_text(subject) or "a clean product photography scene"
    style = sanitize_style_hint_for_image_edit(style_hint)
    instruction = f"Place the product in a new environment: {scene}."
    directive = mode_prompt_directive(mode)
    if directive:
        instruction += f" {directive}"
    if style:
        instruction += f" Use this style direction only where it supports the scene: {style}."
    instruction += (
        " Replace the original background completely with the requested scene. "
        "Include all requested scene props clearly when they are mentioned, such as candles, marble, table surfaces, flowers, or lights. "
        "If candles are requested, show visible lit candles in the scene. If marble table is requested, show a clearly visible marble tabletop surface. "
        "Do not leave a plain white, empty, or catalog-cutout background when props or a scene are requested. "
        f"{IMAGE_EDIT_PRESERVATION_DIRECTIVE}"
    )
    return instruction


def prompt_expander_user_text(subject: str, style_hint: str = "", mode: str | None = None) -> str:
    scene = normalize_scene_text(subject)
    style = sanitize_style_hint_for_image_edit(style_hint)
    directive = mode_prompt_directive(mode)
    parts = [f"Scene request: {scene}"]
    if directive:
        parts.append(f"Mode objective: {directive}")
    if style:
        parts.append(f"Style context: {style}")
    return "\n".join(parts)


async def expand_prompt_for_qwen(subject: str, style_hint: str = "", mode: str | None = None) -> str:
    """Use DeepSeek to expand a short user prompt into a proper Qwen Image Edit instruction.
    Falls back to compose_img2img_prompt() if DEEPSEEK_API_KEY is absent or the call fails."""
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        logger.warning("DEEPSEEK_API_KEY not set — using fallback prompt")
        return compose_img2img_prompt(subject, style_hint, mode)
    try:
        user_text = prompt_expander_user_text(subject, style_hint, mode)
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
                                "The user gives a short scene description and optional style context in any language.\n"
                                "OUTPUT FORMAT — you must follow this exactly:\n"
                                "  Change only the background and product environment to [rich scene description with visible requested props, surface, lighting, atmosphere]. Keep the uploaded product exactly as it appears, including label artwork, logos, packaging text, shape, cap, material, and color.\n"
                                "Rules:\n"
                                "- First word of output MUST be 'Change'\n"
                                "- Last sentence MUST preserve the uploaded product exactly, including label artwork, logos, packaging text, shape, cap, material, and color.\n"
                                "- Correct obvious spelling mistakes in scene props, for example mabel/marbel->marble, tabel->table, candels->candles.\n"
                                "- If the user mentions concrete props such as candles, flowers, marble, table, lights, boxes, fabric, include those props visibly.\n"
                                "- If the user asks for a scene, do not create a plain white catalog cutout background.\n"
                                "- Ignore or rewrite any style/context phrase that says no text, no logo, no label, remove text, or remove logo; those phrases mean no NEW text/logos, not changing the product.\n"
                                "- Do not translate, rewrite, invent, replace, simplify, or remove existing product label text or branding.\n"
                                "- Do not add new labels, new logos, fake brand names, or text overlays.\n"
                                "- Follow the mode objective when one is provided, but never sacrifice product accuracy.\n"
                                "- Ignore marketplace, export-size, crop, platform, and social-channel instructions unless they describe visual style.\n"
                                "- 1-2 sentences only. No extra commentary. No lists.\n"
                                "Example input: marble table with candles\n"
                                "Example output: Change only the background and product environment to a polished white marble table with three visible lit pillar candles casting warm golden light against an elegant boutique backdrop. Keep the uploaded product exactly as it appears, including label artwork, logos, packaging text, shape, cap, material, and color."
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
                return compose_img2img_prompt(subject, style_hint, mode)
            logger.info("DeepSeek expanded prompt: %s", expanded)
            return expanded
    except Exception as exc:
        logger.warning("DeepSeek prompt expansion failed (%s) — using fallback", exc)
        return compose_img2img_prompt(subject, style_hint, mode)


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


def render_workflow(
    workflow: dict[str, Any],
    request: Any,
    image_name: str = "",
    expanded_prompt: str | None = None,
    mode_override: str | None = None,
) -> dict[str, Any]:
    selected_mode = mode_override or getattr(request, "mode", None)
    if expanded_prompt is not None:
        prompt = expanded_prompt
    elif image_name:
        prompt = compose_img2img_prompt(request.subject, request.style_hint, selected_mode)
    else:
        prompt = compose_prompt(request.subject, request.style_hint)
    request_seed = int(getattr(request, "seed", -1))
    seed = int(request_seed if request_seed >= 0 else time.time_ns() % (2**32))
    width, height = generation_dimensions(selected_mode)
    replacements = {
        "{{prompt}}": prompt,
        "{{subject}}": request.subject,
        "{{style_hint}}": request.style_hint,
        "{{negative_prompt}}": IMAGE_EDIT_NEGATIVE_PROMPT,
        "{{seed}}": seed,
        "{{width}}": width,
        "{{height}}": height,
        "{{image_name}}": image_name,
        "{{duration_s}}": int(getattr(request, "duration_s", 3)),
        "{{video_resolution}}": os.getenv("COMFYUI_VIDEO_RESOLUTION", "720p"),
        "{{video_aspect_ratio}}": video_aspect_ratio(selected_mode),
        "{{upscale_4k}}": bool(getattr(request, "upscale_4k", False)),
        "{{mode}}": selected_mode,
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

    async def run_media_workflow(self, workflow: dict[str, Any], kinds: set[str]) -> dict[str, Any]:
        prompt_id = await self.queue_prompt(workflow)
        outputs = await self.wait_for_outputs(prompt_id)
        media_output = _first_output(outputs, kinds)
        if not media_output:
            raise ComfyGenerationError(f"ComfyUI finished without a {'/'.join(sorted(kinds))} output")
        media, fmt = await self.download_output(media_output)
        return {
            "status": "success",
            "media": media,
            "format": fmt.upper(),
            "kind": media_output.get("kind"),
            "prompt_id": prompt_id,
            "filename": media_output.get("filename"),
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
    mode = getattr(request, "mode", "?")
    effective_mode = effective_generation_mode(mode, getattr(request, "subject", ""), bool(request.image))
    is_catalog = effective_mode == "catalog"

    if request.image:
        image_name = await client.upload_image(request.image)
        workflow_file = "catalog_birefnet.json" if is_catalog else "product_image_img2img.json"
    else:
        workflow_file = "product_image.json"

    logger.info(
        "[GEN] mode=%s effective_mode=%s has_image=%s is_catalog=%s workflow=%s",
        mode,
        effective_mode,
        bool(request.image),
        is_catalog,
        workflow_file,
    )

    expanded_prompt = None
    if image_name and not is_catalog:
        expanded_prompt = await expand_prompt_for_qwen(
            request.subject,
            getattr(request, "style_hint", ""),
            effective_mode,
        )

    logger.info("[GEN] subject=%r expanded_prompt=%r", getattr(request, "subject", ""), expanded_prompt)
    workflow = render_workflow(
        load_workflow(workflow_file),
        request,
        image_name=image_name,
        expanded_prompt=expanded_prompt,
        mode_override=effective_mode,
    )
    result = await client.run_workflow(workflow)
    result.setdefault("mode", effective_mode)

    # Catalog BiRefNet returns RGBA — composite onto white so output is clean white-bg JPEG/PNG
    if is_catalog and request.image and result.get("status") == "success":
        result = _composite_on_white(result)

    return result


async def generate_video_with_comfy(request: Any) -> dict[str, Any]:
    base_url = await resolve_comfy_url()
    client = ComfyClient(base_url)

    image_name = ""
    if getattr(request, "image", None):
        image_name = await client.upload_image(request.image)

    workflow_file = os.getenv("COMFYUI_VIDEO_WORKFLOW", "product_video.json")
    logger.info(
        "[VIDEO] mode=%s has_image=%s workflow=%s duration=%s",
        getattr(request, "mode", "?"),
        bool(image_name),
        workflow_file,
        getattr(request, "duration_s", 3),
    )

    workflow = render_workflow(
        load_workflow(workflow_file),
        request,
        image_name=image_name,
    )
    result = await client.run_media_workflow(workflow, {"videos", "gifs"})
    return {
        "status": "success",
        "video": result["media"],
        "format": result["format"],
        "kind": result.get("kind"),
        "prompt_id": result.get("prompt_id"),
        "filename": result.get("filename"),
        "mode": getattr(request, "mode", None),
    }


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

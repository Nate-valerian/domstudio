#!/bin/bash
# DomStudio vast.ai setup script
# Runs once at startup, skips if models already present

COMFYUI=/workspace/ComfyUI
NODES=$COMFYUI/custom_nodes
MODELS=$COMFYUI/models

echo "[domstudio] Starting setup..."

# ── Custom nodes ──────────────────────────────────────────────────────────────

if [ ! -d "$NODES/ComfyUI-nunchaku" ]; then
  echo "[domstudio] Installing ComfyUI-nunchaku..."
  GIT_TERMINAL_PROMPT=0 git clone https://github.com/nunchaku-ai/ComfyUI-nunchaku.git "$NODES/ComfyUI-nunchaku"
  pip install -r "$NODES/ComfyUI-nunchaku/requirements.txt" -q
else
  echo "[domstudio] ComfyUI-nunchaku already installed"
fi

if [ ! -d "$NODES/ComfyUI-RMBG" ]; then
  echo "[domstudio] Installing ComfyUI-RMBG..."
  GIT_TERMINAL_PROMPT=0 git clone https://github.com/1038lab/ComfyUI-RMBG.git "$NODES/ComfyUI-RMBG"
  pip install -r "$NODES/ComfyUI-RMBG/requirements.txt" -q
else
  echo "[domstudio] ComfyUI-RMBG already installed"
fi

if [ ! -d "$NODES/ComfyUI-WanVideoWrapper" ]; then
  echo "[domstudio] Installing ComfyUI-WanVideoWrapper..."
  GIT_TERMINAL_PROMPT=0 git clone https://github.com/kijai/ComfyUI-WanVideoWrapper.git "$NODES/ComfyUI-WanVideoWrapper"
  pip install -r "$NODES/ComfyUI-WanVideoWrapper/requirements.txt" -q
else
  echo "[domstudio] ComfyUI-WanVideoWrapper already installed"
fi

if [ ! -d "$NODES/ComfyUI-VideoHelperSuite" ]; then
  echo "[domstudio] Installing ComfyUI-VideoHelperSuite..."
  GIT_TERMINAL_PROMPT=0 git clone https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite.git "$NODES/ComfyUI-VideoHelperSuite"
  pip install -r "$NODES/ComfyUI-VideoHelperSuite/requirements.txt" -q
else
  echo "[domstudio] ComfyUI-VideoHelperSuite already installed"
fi

if [ ! -d "$NODES/ComfyUI-KJNodes" ]; then
  echo "[domstudio] Installing ComfyUI-KJNodes..."
  GIT_TERMINAL_PROMPT=0 git clone https://github.com/kijai/ComfyUI-KJNodes.git "$NODES/ComfyUI-KJNodes"
  pip install -r "$NODES/ComfyUI-KJNodes/requirements.txt" -q
else
  echo "[domstudio] ComfyUI-KJNodes already installed"
fi

pip install "https://github.com/nunchaku-ai/nunchaku/releases/download/v1.2.1/nunchaku-1.2.1+cu12.8torch2.10-cp312-cp312-linux_x86_64.whl" -q

# ── Models ────────────────────────────────────────────────────────────────────

mkdir -p "$MODELS/diffusion_models" "$MODELS/clip" "$MODELS/vae" "$MODELS/BiRefNet" \
         "$MODELS/WanVideo/Lightx2v" "$MODELS/wanvideo" "$MODELS/clip_vision"

QWEN_MODEL="$MODELS/diffusion_models/svdq-int4_r128-qwen-image-edit-2509-lightningv2.0-4steps.safetensors"
CLIP_MODEL="$MODELS/clip/qwen_2.5_vl_7b_fp8_scaled.safetensors"
VAE_MODEL="$MODELS/vae/qwen_image_vae.safetensors"
BIREFNET_MODEL="$MODELS/BiRefNet/General-HR.safetensors"

if [ ! -f "$QWEN_MODEL" ]; then
  echo "[domstudio] Downloading Qwen DiT model (~4GB)..."
  wget -q --show-progress -O "$QWEN_MODEL" \
    "https://huggingface.co/nunchaku-ai/nunchaku-qwen-image-edit-2509/resolve/main/svdq-int4_r128-qwen-image-edit-2509-lightningv2.0-4steps.safetensors"
else
  echo "[domstudio] Qwen DiT model present"
fi

if [ ! -f "$CLIP_MODEL" ]; then
  echo "[domstudio] Downloading CLIP model (~8GB)..."
  wget -q --show-progress -O "$CLIP_MODEL" \
    "https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors"
else
  echo "[domstudio] CLIP model present"
fi

if [ ! -f "$VAE_MODEL" ]; then
  echo "[domstudio] Downloading VAE (~300MB)..."
  wget -q --show-progress -O "$VAE_MODEL" \
    "https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/vae/qwen_image_vae.safetensors"
else
  echo "[domstudio] VAE present"
fi

if [ ! -f "$BIREFNET_MODEL" ]; then
  echo "[domstudio] Downloading BiRefNet (~800MB)..."
  wget -q --show-progress -O "$BIREFNET_MODEL" \
    "https://huggingface.co/ZhengPeng7/BiRefNet/resolve/main/model.safetensors"
else
  echo "[domstudio] BiRefNet model present"
fi

WAN_MODEL="$MODELS/WanVideo/Wan2_1-I2V-14B-480P_fp8_e4m3fn.safetensors"
WAN_T5="$MODELS/WanVideo/umt5-xxl-enc-bf16.safetensors"
WAN_VAE="$MODELS/wanvideo/Wan2_1_VAE_bf16.safetensors"
WAN_CLIP="$MODELS/clip_vision/clip_vision_h.safetensors"

if [ ! -f "$WAN_MODEL" ]; then
  echo "[domstudio] Downloading Wan2.1 14B I2V model (~16GB)..."
  wget -q --show-progress -O "$WAN_MODEL" \
    "https://huggingface.co/Kijai/WanVideo_comfy/resolve/main/Wan2_1-I2V-14B-480P_fp8_e4m3fn.safetensors"
else
  echo "[domstudio] Wan2.1 model present"
fi

if [ ! -f "$WAN_T5" ]; then
  echo "[domstudio] Downloading T5 text encoder (~11GB)..."
  wget -q --show-progress -O "$WAN_T5" \
    "https://huggingface.co/Kijai/WanVideo_comfy/resolve/main/umt5-xxl-enc-bf16.safetensors"
else
  echo "[domstudio] T5 encoder present"
fi

if [ ! -f "$WAN_VAE" ] || [ ! -s "$WAN_VAE" ]; then
  echo "[domstudio] Downloading Wan2.1 VAE (~243MB)..."
  wget -q --show-progress -O "$WAN_VAE" \
    "https://huggingface.co/Kijai/WanVideo_comfy/resolve/main/Wan2_1_VAE_bf16.safetensors"
else
  echo "[domstudio] Wan2.1 VAE present"
fi

if [ ! -f "$WAN_CLIP" ] || [ ! -s "$WAN_CLIP" ]; then
  echo "[domstudio] Downloading CLIP vision (~1GB)..."
  wget -q --show-progress -O "$WAN_CLIP" \
    "https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/clip_vision/clip_vision_h.safetensors"
else
  echo "[domstudio] CLIP vision present"
fi

# ── Start ComfyUI and get tunnel URL ─────────────────────────────────────────

echo "[domstudio] Starting ComfyUI..."
supervisorctl start comfyui

echo "[domstudio] Waiting for ComfyUI to be ready..."
until curl -s http://localhost:18188/system_stats > /dev/null 2>&1; do sleep 3; done

TUNNEL=$(curl -s "http://localhost:11112/get-quick-tunnel/http://localhost:18188" | python3 -c "import sys,json; print(json.load(sys.stdin)['tunnel_url'])" 2>/dev/null)
echo ""
echo "=============================="
echo " ComfyUI: $TUNNEL"
echo " Update COMFYUI_URL in Amvera"
echo "=============================="

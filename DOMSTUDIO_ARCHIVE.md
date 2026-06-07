# DomStudio Archive

## June 7, 2026 - Midday Status Note

User asked:

> so, since morning, what have you done and accomplished?

Archived answer:

Honestly: not enough, and not the right final outcome for the visual cards.

What did get accomplished today:

1. AutoDL / ComfyUI is running and reachable at `http://127.0.0.1:6006`.
2. We picked and used the `vGPU-32GB` AutoDL instance.
3. You downloaded the Qwen/Nunchaku model successfully:
   `svdq-int4_r32-qwen-image-lightningv1.1-8steps.safetensors`
4. Backend Comfy foundation was added and committed:
   - `55de9d2 Add ComfyUI generation client`
   - `785555f Wire Comfy Qwen image workflow`
5. The backend now has a Comfy client, AutoDL URL support, workflow loading, and tests/build around that path.
6. I confirmed the current Comfy setup is Qwen/Nunchaku image generation, not Flux Kontext, not Qwen Image Edit, not dedicated virtual try-on.
7. I proved AutoDL has many video nodes installed, including Wan/VideoHelperSuite, but I did not produce a real proper per-function video workflow.
8. I made a bad generic "live video" pass, then reverted it:
   - bad commit: `602ea82`
   - revert commit: `8003074`
9. Frontend build currently passes after the revert.

What did not get accomplished:

1. The site cards are not finished to your standard.
2. The before/after product consistency problem is not properly solved.
3. The 3-second videos are not real AI videos. My pan/zoom/shaking approach was lame, and you were right to reject it.
4. I did not correctly respect that each card has its own functionality.
5. I wasted time trying to patch visuals instead of setting up the correct workflow per mode.

So the real status is: backend/AutoDL foundation moved forward, but the landing visuals/videos are still not solved.

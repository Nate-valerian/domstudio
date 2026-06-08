# DomStudio Product Handoff

Created: June 6, 2026

## Mandatory Read First

Before starting any DomStudio work, read this section and follow it.

What went wrong on June 7, 2026:

1. I wasted the user's time and AutoDL money by pushing ahead without respecting
   the actual product requirement.
2. I treated all landing cards with one generic approach, even after the user
   said each card has its own functionality.
3. I made fake "live video" by adding pan/zoom/shaking motion to still images.
   That is not real AI video and must not be presented as video generation.
4. I tried to patch visual symptoms instead of setting up the correct workflow
   per card/mode.
5. I did not stop early enough when the outputs were visibly wrong.
6. I over-relied on Qwen/Nunchaku base image generation for tasks that needed
   image editing, controlled identity preservation, virtual try-on, or real
   image-to-video.

Rules for future work:

1. Do not use one generic treatment for all cards. Each card must demonstrate
   its own capability:
   - Catalog: marketplace cleanup, clean background, accurate product.
   - Product: premium product lighting/composition.
   - Creative: campaign/social creative.
   - Lifestyle: product placed naturally in a scene.
   - Fitting: real virtual try-on workflow, not random redraw.
   - Stories: vertical social/video format.
2. Before/after images must preserve the same product or person unless the user
   explicitly asks for a change. If identity changes, reject the output.
3. Do not call a pan/zoom/shaking still image a video. A 3-second video must use
   a real image-to-video/video workflow with meaningful motion.
4. Do not spend AutoDL/GPU money on broad experiments without a narrow test plan.
   Test one card first, inspect it, then continue.
5. For fitting, product identity, or precise edits, prefer dedicated tools such
   as Flux Kontext / Flux image edit, Qwen Image Edit, or a virtual try-on model.
   Do not assume base Qwen image generation is enough.
6. If outputs are wrong twice in the same direction, stop and change workflow
   instead of generating more variations.
7. Be honest in status updates. Say "not solved" when it is not solved.

## Current Direction

The project is a DomStudio AI product-photo SaaS. The frontend/backend are already
deployable, and the current UI should stay close to the original style for now.

The attempted full dark/premium restyle was rejected because it looked dated. The
old stylesheet was restored. Future UI work should be surgical: improve polish
without replacing the whole visual direction.

## User Constraint

At the beginning, avoid features that create high storage or bandwidth costs.
Prioritize features that are mostly UI, metadata, prompt logic, or client-side
processing.

## Recommended Low-Cost Feature Roadmap

1. Marketplace presets
   - Wildberries
   - Ozon
   - Yandex Market
   - Instagram Post
   - Story 9:16
   - Website Banner
   - Changes prompt, aspect ratio, crop instructions, and output style.

2. Style templates
   - Clean catalog
   - Premium jewelry
   - Cosmetics macro
   - Fashion model
   - Minimal beige
   - Dark luxury
   - Social media creative
   - Mostly prompt presets.

3. Prompt helper
   - Ask product type, platform, desired style, brand colors, and constraints.
   - Generate a strong prompt automatically.

4. Regenerate variations
   - Cleaner
   - More premium
   - Brighter
   - Different background
   - Closer crop
   - More realistic
   - Costs GPU only when the user clicks.

5. Browser-only recent history
   - Store last 5 results in browser localStorage or IndexedDB.
   - Avoid server image storage.
   - Optional auto-delete after 24 hours.

6. Client-side export formats
   - PNG
   - JPG
   - WebP
   - 1080x1080
   - 4:5
   - 9:16
   - Process in browser where possible.

7. Brand preferences
   - Brand colors
   - Preferred background
   - Default marketplace
   - Default style
   - Do-not-use words
   - Tiny database storage.

## Avoid At First

- Batch upload
- Permanent cloud gallery
- Team sharing
- Video generation
- Many 4K upscales
- Large image storage

## Suggested First Implementation Batch

Start with:

1. Marketplace presets
2. Style templates
3. Prompt helper
4. Regenerate buttons
5. Browser-only recent history
6. Client-side export sizes

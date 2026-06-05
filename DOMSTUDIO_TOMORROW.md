# DomStudio Product Handoff

Created: June 6, 2026

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


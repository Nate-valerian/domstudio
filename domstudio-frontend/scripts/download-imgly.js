// Downloads imgly model files from staticimgly.com into public/imgly/
// Run during Vercel build so files are served as same-origin static assets (no CORS issue).
// Files are NOT committed to git — downloaded fresh each build.

import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/";
const OUT_DIR = join(__dirname, "../public/imgly");

const MODELS = [
  "/models/isnet_quint8",
  "/models/isnet",
  "/onnxruntime-web/ort-wasm-simd-threaded.jsep.wasm",
  "/onnxruntime-web/ort-wasm-simd-threaded.wasm",
  "/onnxruntime-web/ort-wasm-simd-threaded.jsep.mjs",
  "/onnxruntime-web/ort-wasm-simd-threaded.mjs",
];

const BATCH = 4;
const RETRIES = 5;
const TIMEOUT_MS = 30000;

async function fetchWithRetry(url, retries = RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return res;
    } catch (err) {
      clearTimeout(timer);
      if (attempt === retries) throw err;
      const delay = 1000 * 2 ** (attempt - 1);
      console.warn(`\nretry ${attempt}/${retries} for ${url} after ${err.message || err} (waiting ${delay}ms)`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

async function dl(url, dest) {
  if (existsSync(dest)) return;
  const res = await fetchWithRetry(url);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  process.stdout.write(".");
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const res = await fetchWithRetry(BASE + "resources.json");
  const resources = await res.json();
  writeFileSync(join(OUT_DIR, "resources.json"), JSON.stringify(resources));
  console.log("resources.json saved");

  const chunkNames = new Set();
  for (const model of MODELS) {
    const entry = resources[model];
    if (!entry) { console.warn(`missing: ${model}`); continue; }
    for (const chunk of entry.chunks) chunkNames.add(chunk.name);
  }

  const list = [...chunkNames];
  console.log(`Downloading ${list.length} chunks (~${Math.round(list.length * 4)} MB estimated)...`);

  for (let i = 0; i < list.length; i += BATCH) {
    await Promise.all(
      list.slice(i, i + BATCH).map((name) => dl(BASE + name, join(OUT_DIR, name)))
    );
  }

  console.log(`\nDone — ${list.length} chunks in ${OUT_DIR}`);
}

main().catch((err) => { console.error(err); process.exit(1); });

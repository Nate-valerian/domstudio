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

const BATCH = 8;

async function dl(url, dest) {
  if (existsSync(dest)) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  process.stdout.write(".");
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const res = await fetch(BASE + "resources.json");
  if (!res.ok) throw new Error(`resources.json: ${res.status}`);
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

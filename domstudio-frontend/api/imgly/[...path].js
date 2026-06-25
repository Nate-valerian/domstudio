const BASE = "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/";

export default async function handler(req, res) {
  const segments = req.query.path;
  if (!segments) return res.status(400).end("Missing path");

  const filePath = Array.isArray(segments) ? segments.join("/") : segments;
  const url = BASE + filePath;

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) return res.status(upstream.status).end();

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const buffer = Buffer.from(await upstream.arrayBuffer());

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Content-Length", buffer.length);
    res.status(200).send(buffer);
  } catch {
    res.status(502).end("Upstream error");
  }
}

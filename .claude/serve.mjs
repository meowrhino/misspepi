import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = "/Users/meowrhino/Desktop/misspepi";
const PORT = 5178;
const TYPES = {
  ".html":"text/html", ".css":"text/css", ".js":"text/javascript",
  ".mjs":"text/javascript", ".json":"application/json", ".svg":"image/svg+xml",
  ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg",
  ".webp":"image/webp", ".gif":"image/gif", ".mp4":"video/mp4", ".mov":"video/quicktime",
};

createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (path === "/") path = "/index.html";
    const file = normalize(join(ROOT, path));
    if (!file.startsWith(ROOT)) { res.writeHead(403).end("forbidden"); return; }
    const data = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" }).end("not found");
  }
}).listen(PORT, () => console.log("serving on " + PORT));

import { serve } from "srvx/node";
import handler from "./dist/server/index.js";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const clientDir = join(__dirname, "dist/client");

const MIME = {
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

serve({
  fetch(request) {
    const url = new URL(request.url);
    const filePath = join(clientDir, url.pathname);

    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const content = readFileSync(filePath);
      const ext = extname(filePath);
      return new Response(content, {
        headers: {
          "content-type": MIME[ext] || "application/octet-stream",
          "cache-control": "public, max-age=31536000, immutable",
        },
      });
    }

    return handler.fetch(request);
  },
  port: parseInt(process.env.PORT || "8080"),
  hostname: process.env.HOST || "0.0.0.0",
});

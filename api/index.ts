import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    // Try api/server/index.js first, fallback to dist/server/index.js
    let serverPath = path.resolve(process.cwd(), "api/server/index.js");
    if (!fs.existsSync(serverPath)) {
      serverPath = path.resolve(process.cwd(), "dist/server/index.js");
    }

    const serverUrl = pathToFileURL(serverPath).href;
    const serverModule = await import(serverUrl);
    const handleRequest =
      serverModule.default || serverModule.createServerEntry;

    if (typeof handleRequest !== "function") {
      res
        .status(500)
        .send(`SSR Handler function not found at ${serverPath}`);
      return;
    }

    const protocol = (req.headers["x-forwarded-proto"] as string) || "https";
    const host =
      (req.headers["x-forwarded-host"] as string) ||
      req.headers.host ||
      "localhost";
    const fullUrl = `${protocol}://${host}${req.url}`;

    const headers = new Headers();
    for (const [key, val] of Object.entries(req.headers)) {
      if (Array.isArray(val)) {
        for (const item of val) headers.append(key, item);
      } else if (typeof val === "string") {
        headers.set(key, val);
      }
    }

    const webRequest = new Request(fullUrl, {
      method: req.method,
      headers,
    });

    const webResponse = await handleRequest(webRequest);

    res.status(webResponse.status);
    webResponse.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });

    const bodyArrayBuffer = await webResponse.arrayBuffer();
    res.end(Buffer.from(bodyArrayBuffer));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Vercel SSR Handler Error:", error);
    res.status(500).send(`SSR Render Error: ${message}`);
  }
}

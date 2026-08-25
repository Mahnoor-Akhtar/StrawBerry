import type { VercelRequest, VercelResponse } from "@vercel/node";

type ServerModule = {
  default?: (req: Request) => Promise<Response>;
  createServerEntry?: (req: Request) => Promise<Response>;
};

// Static relative import so Vercel NFT (Node File Trace) includes api/server in function output
// @ts-expect-error - api/server/index.js is generated during npm run build
import serverModuleImport from "./server/index.js";

const serverModule = serverModuleImport as ServerModule | undefined;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const handleRequest =
      typeof serverModule === "function"
        ? (serverModule as (req: Request) => Promise<Response>)
        : serverModule?.default || serverModule?.createServerEntry;

    if (typeof handleRequest !== "function") {
      res
        .status(500)
        .send("SSR Handler function not found in api/server/index.js");
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

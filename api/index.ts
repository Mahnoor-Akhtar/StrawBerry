export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  try {
    // Dynamically import the compiled TanStack Start server handler from dist/server
    // @ts-expect-error - dist/server output is generated dynamically during build
    const serverModule = await import("../dist/server/index.js");
    const handleRequest =
      serverModule.default || serverModule.createServerEntry;

    if (typeof handleRequest === "function") {
      return await handleRequest(request);
    }
    return new Response("SSR Handler Not Found", { status: 500 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(`SSR Render Error: ${message}`, { status: 500 });
  }
}

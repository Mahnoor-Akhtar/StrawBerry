import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Disable Cloudflare-specific worker packaging when building for Vercel
  cloudflare: process.env.VERCEL ? false : undefined,
});

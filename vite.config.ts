import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
  server: {
    preset: "vercel",
  },
  tanstackStart: {
    appDirectory: "src",
  },
});

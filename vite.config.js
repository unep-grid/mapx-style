import { defineConfig } from "vite";
import { varlockVitePlugin } from "@varlock/vite-integration";

export default defineConfig({
  root: "src",
  publicDir: "../public",
  // base must match the GitHub Pages repo path for production deploy
  base: "/mapx-style/",
  plugins: [varlockVitePlugin()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    target: "esnext",
  },
});

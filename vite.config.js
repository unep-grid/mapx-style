import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  // load .env from repo root, not from src/ (which is the Vite root)
  envDir: "..",
  publicDir: "../public",
  // base must match the GitHub Pages repo path for production deploy
  base: "/mapx-style/",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    target: "esnext",
  },
});

import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
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

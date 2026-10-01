import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://jialiangz.github.io",
  build: {
    // keep the classic asset directory names for parity with the Jekyll site
    assets: "assets",
  },
  vite: {
    css: {
      devSourcemap: false,
    },
  },
});

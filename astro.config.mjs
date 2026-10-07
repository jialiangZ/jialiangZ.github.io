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
      preprocessorOptions: {
        scss: {
          // susy/breakpoint vendor libs are unmaintained and still use
          // legacy @import / if() / global built-ins; the theme itself
          // can't move to @use without rewriting them. Safe until Sass 3.0.
          silenceDeprecations: [
            "import",
            "global-builtin",
            "slash-div",
            "color-functions",
            "if-function",
          ],
        },
      },
    },
  },
});

import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";
import fs from "fs";

const generateManifestPlugin = (): Plugin => {
  return {
    name: "generate-manifest",
    apply: "build",
    async buildStart() {
      try {
        const { MANIFEST_DATA } = await import("./src/data/index");
        const outDir = "public";
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(
          path.join(outDir, "manifest.json"),
          JSON.stringify(MANIFEST_DATA, null, 2),
          "utf-8"
        );
      } catch (error) {
        console.error("Failed to generate manifest:", error);
      }
    },
  };
};

const modifyIndexHtmlPlugin = (): Plugin => {
  return {
    name: "modify-index-html",
    apply: "build",
    transformIndexHtml(html) {
      const { MANIFEST_DATA } = require("./src/data/index");
      return html
        .replace(/<title>.*<\/title>/, `<title>${MANIFEST_DATA.name}</title>`)
        .replace(
          /<meta name="description" content=".*">/,
          `<meta name="description" content="${
            MANIFEST_DATA.description ?? ""
          }">`
        );
    },
  };
};

export default defineConfig({
  plugins: [
    generateManifestPlugin(),
    modifyIndexHtmlPlugin(),
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "src/scripts/content.js",
          dest: "",
        },
      ],
    }),
  ],
  build: {
    outDir: "dist",
  },
});

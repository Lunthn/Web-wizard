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


export default defineConfig({
  plugins: [
    generateManifestPlugin(),
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "src/scripts/content.js",
          dest: "",
        },
        {
          src: "src/scripts/background.js",
          dest: "",
        },
      ],
    }),
  ],
  build: {
    outDir: "dist",
  },
});

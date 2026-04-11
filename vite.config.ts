import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import fs from "fs";

function inlineWasmUrls(code: string, dir: string): string {
  return code.replace(
    /new URL\(['"]([^'"]+_bg\.wasm)['"],\s*import\.meta\.url\)/g,
    (match, wasmFile) => {
      const wasmPath = path.resolve(dir, wasmFile);
      if (fs.existsSync(wasmPath)) {
        const base64 = fs.readFileSync(wasmPath).toString("base64");
        return `"data:application/wasm;base64,${base64}"`;
      }
      return match;
    }
  );
}

const inlineWasmPlugin = {
  name: "inline-wasm-urls",
  transform(code: string, id: string) {
    if (id.includes("pkg-esm") && id.endsWith(".js") && code.includes("_bg.wasm")) {
      const patched = inlineWasmUrls(code, path.dirname(id));
      if (patched !== code) return patched;
    }
    return null;
  },
};

const wasmDataUrlPlugin = {
  name: "wasm-data-url",
  setup(build: import("esbuild").PluginBuild) {
    build.onLoad({ filter: /\.wasm$/ }, (args) => {
      const data = fs.readFileSync(args.path);
      const base64 = data.toString("base64");
      return {
        contents: `export default "data:application/wasm;base64,${base64}"`,
        loader: "js" as const,
      };
    });
    build.onLoad({ filter: /pkg-esm[/\\][^/\\]+\.js$/ }, (args) => {
      const code = fs.readFileSync(args.path, "utf8");
      if (!code.includes("_bg.wasm")) return null as any;
      const patched = inlineWasmUrls(code, path.dirname(args.path));
      if (patched !== code) {
        return { contents: patched, loader: "js" as const };
      }
      return null as any;
    });
  },
};

const port = Number(process.env.PORT) || 5173;
const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  plugins: [
    inlineWasmPlugin,
    nodePolyfills({
      globals: { Buffer: true, global: true, process: true },
      protocolImports: true,
    }),
    wasm(),
    topLevelAwait(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom", "wagmi", "viem", "@wagmi/core"],
  },
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    include: [
      "buffer",
      "@railgun-community/wallet",
      "@railgun-community/shared-models",
    ],
    esbuildOptions: {
      target: "esnext",
      define: {
        global: "globalThis",
      },
      plugins: [wasmDataUrlPlugin],
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    target: "esnext",
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});

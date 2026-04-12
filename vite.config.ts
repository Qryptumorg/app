import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
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

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

// esbuild plugin: inlines .wasm imports as data URLs and patches pkg-esm JS wrappers
// that use fetch(new URL('*_bg.wasm', import.meta.url)) so the pre-bundle resolves correctly
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
    // Generic: patch any pkg-esm JS file that references _bg.wasm via new URL(...)
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
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
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
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    target: "esnext",
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});

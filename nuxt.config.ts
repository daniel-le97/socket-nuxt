import { resolve } from "path";
import { existsSync, promises as fsp } from "node:fs";
import type { Plugin } from "rollup";
function fixGlobals(): Plugin {
  return {
    name: "socket-fix-globals",
    renderChunk(code: string, chunk: any) {
      code = code
        .replace("_global.process = _global.process || process$1;", "")
        .replace(
          "const process = _global.process;",
          "const process = _global.process || process$1;"
        )
        // when building with ssr = true, _global becomes _global$1
        .replace("_global$1.process = _global$1.process || process$1;", "")
        .replace(
          "const process = _global$1.process;",
          "const process = _global$1.process || process$1;"
        );

      let changedContents =
        `globalThis = globalThis || self || global || {};` + code;

      return {
        code: chunk.isEntry ? changedContents : code,
        map: null,
      };
    },
  };
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,

  vite: {
    build: {
      reportCompressedSize: false,
      rollupOptions: {
        external: [/^socket:.*/],
      },
    },
  },
  app: {
    baseURL: "/nitro/",
  },
  nitro: {
    preset: 'service-worker',
    output: {
      serverDir: "{{ output.dir }}/public/server",
    },
    entry: process.cwd() + "/entry.ts",
    commands:{
      'preview':'ssc build -r',
    },
    hooks: {
      "rollup:before": (nitro, config) => {
        const plugins = config.plugins as Plugin[];
        const found = plugins.findIndex((p) => p.name === "import-meta") + 1;
        plugins.splice(found, 0, fixGlobals());
        config.plugins = plugins;
      },
      async compiled(nitro) {
        const indexHtml = resolve(nitro.options.output.publicDir, "index.html");
        const html = await fsp.readFile("./index.html", "utf8");
        if (!existsSync(indexHtml)) {
          // write the index.html file from the entry.html template
          await fsp.writeFile(indexHtml, html, "utf8");
          // await fsp.writeFile(
          //   resolve(nitro.options.output.publicDir, "worker.js"),
          //   await fsp.readFile("./worker.js"),
          //   "utf8"
          // );
        }
      },
    },
    minify: false,
    noExternals: true,
    node: false,
    inlineDynamicImports: true,
    rollupConfig: {
      'cache':true,
      external: [/^socket:.*/],
      output:{
        'format': 'esm'
      }
      // 'perf':true
    },
  },
});

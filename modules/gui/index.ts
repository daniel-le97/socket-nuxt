import {
  addImportsDir,
  createResolver,
  defineNuxtModule,
  resolvePath,
} from "nuxt/kit";
import { defu } from "defu";
import type { Plugin } from "rollup";

import { existsSync, promises as fsp } from "node:fs";
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

export default defineNuxtModule({
  meta: {
    name: "socket-runtime",
  },
  setup: async (nuxtOptions, nuxt) => {
    console.log("socket-runtime setup");

    const { resolve } = createResolver(import.meta.url);
    nuxt.options.ssr = false;
    nuxt.options.app.baseURL = "/nitro/";
    nuxt.options.app.cdnURL = "/nitro/";
    nuxt.options.vite.build = defu(nuxt.options.vite.build, {
      reportCompressedSize: false,
      rollupOptions: {
        external: [/^socket:.*/],
      },
    });
    nuxt.options.nitro = defu(nuxt.options.nitro, {
      entry: resolve("./runtime/entry.ts"),
      output: {
        serverDir: "{{ output.dir }}/public/server",
      },
    });
    nuxt.options.nitro.baseURL = "/nitro/";
    nuxt.options.nitro.noExternals = true;
    nuxt.options.nitro.node = false;
    nuxt.options.nitro.inlineDynamicImports = true;
    nuxt.options.nitro.rollupConfig = {
      external: [/^socket:.*/],
    };
    nuxt.options.nitro.plugins = [
      resolve("./runtime/server/plugins/preload.ts"),
    ];
    nuxt.options.nitro.commands = {
      'preview': 'ssc build -r',
      "deploy": 'ssc build --prod'
    }
    nuxt.options.nitro.hooks = {
      "rollup:before": (nitro, config) => {
        const plugins = config.plugins as Plugin[];
        const found = plugins.findIndex((p) => p.name === "import-meta") + 1;
        plugins.splice(found, 0, fixGlobals());
        config.plugins = plugins;
      },

      async compiled(nitro) {
        const indexHtml = resolve(nitro.options.output.publicDir, "index.html");
        if (!existsSync(indexHtml)) {
          const html = await fsp.readFile(
            resolve("./runtime/index.html"),
            "utf-8"
          );
          // write the index.html file from the entry.html template
          await fsp.writeFile(indexHtml, html, "utf8");
        }
      },
    };

    // nuxt.options.vite.build.rollupOptions.external
    // console.log(
    //   "nuxt.options.vite.build.rollupOptions.external",
    //   nuxt.options.vite.build.rollupOptions.external
    // );

    console.log("socket runtime setup done");
  },
});

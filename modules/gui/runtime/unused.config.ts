import { existsSync, promises as fsp } from "node:fs";
import { resolve } from "pathe";
import { joinURL } from "ufo";
import type { Nitro } from "nitropack";
import type { NitroPreset } from "nitropack";
import { type Plugin } from "rollup";

console.log("nitro.config.ts", import.meta.url);

const getPath = (path: string) => {
  const metaUrl = new URL(import.meta.url).pathname;
  return metaUrl.replace("nitro.config.ts", "runtime/" + path);
};

export default <NitroPreset>{
  baseURL: "/nitro",
  minify: false,
  // serveStatic: true,
  extends: "node-server",
  node: false,
  noExternals: true,
  exportConditions: ["socket"],
  entry: getPath("entry.ts"),
  // output: {
  //   serverDir: "{{ output.dir }}/public/server",
  // },
  // externals: [/^socket:.*/],
  rollupConfig: {
    external: [/^socket:.*/],
  },
  inlineDynamicImports: true,
  // unenv: {
  //   alias: getAliases(),
  // },
  hooks: {
    "rollup:before": (nitro, config) => {
      const plugins = config.plugins as { name: string }[];
      const found = plugins.findIndex((p) => p.name === "import-meta") + 1;
      plugins.splice(found, 0, fixGlobals());
      config.plugins = plugins;
    },
  },
};

function fixGlobals(): Plugin {
  return {
    name: "socket-fix-globals",
    resolveId(this,source, importer, options) {
      if (source.includes('socket')) {
        return false
      }
      return null;
      
    },
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

function getAliases() {
  let alias: Record<string, string> = {};
  const nodeModules = [
    "assert", // Provides assertion testing
    "async_hooks", // Provides async hooks API
    "buffer", // Handles binary data
    "child_process", // Provides child process management
    "cluster", // Supports multi-process scaling
    "crypto", // Provides cryptographic functionality
    "dgram", // Supports UDP datagram sockets
    "dns", // Provides DNS lookup operations
    "events", // Implements event-driven architecture
    "fs", // Provides file system operations
    "fs/promises", // Provides file system operations using promises
    "http", // Implements HTTP server and client
    "https", // Implements HTTPS server and client
    "net", // Supports TCP/IPC networking
    "os", // Provides operating system-related utility methods
    "path", // Provides path-related utility methods
    "perf_hooks", // Provides performance monitoring APIs
    "process", // Provides information about the current process
    "querystring", // Provides utility for URL query strings
    "readline", // Implements Readline interface
    "stream", // Implements stream APIs
    "string_decoder", // Provides decoding functionality for buffer data
    "timers", // Implements timer functions
    "tls", // Implements TLS/SSL protocols
    "tty", // Provides terminal-related functionality
    // "url", // Provides URL parsing utilities
    "util", // Provides utility functions
    "v8", // Provides access to V8 engine APIs
    "vm", // Implements virtual machine contexts
    "worker_threads", // Supports multithreaded worker tasks
    "zlib", // Provides compression/decompression functionalities
  ];
}

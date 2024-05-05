// /// <reference lib="WebWorker" />

// declare const self: ServiceWorkerGlobalScope;
// self.addEventListener("install", (ev) => {
//   console.log("install", ev);
// });
// self.addEventListener("error", (ev) => {
//   console.log("error", ev);
// });
// self.addEventListener("activate", (ev) => {
//   console.log("activate", ev);
// });
// self.addEventListener("unhandledrejection", (ev) => {
//   console.log("unhandledrejection", ev);
// });
// self.addEventListener("rejectionhandled", (ev) => {
//   console.log("rejectionhandled", ev);
// });

import "#internal/nitro/virtual/polyfills";

// @ts-ignore
import { isPublicAssetURL } from "#internal/nitro/virtual/public-assets";

const nitroApp = useNitroApp();

function fixAssetsUrl(inputString: string) {
  const nuxtIndex = inputString.indexOf("/_nuxt/");
  return inputString.substring(nuxtIndex);
}

const handler = toWebHandler(nitroApp.h3App);


export default async (request: Request, env = {}, ctx: any) => {
  try {
    let url = new URL(request.url);

    if (isPublicAssetURL(url.pathname) || url.pathname.includes("/server/")) {
      return;
    }

    let res;

    // idk why but nuxt will not serve its own build assets correctly so we need to fetch them
    if (url.pathname.includes("/_nuxt/")) {
      const fetchURL = fixAssetsUrl(url.pathname);
      res = await fetch(fetchURL);
    }

    if (!res) {
      // res = await handler(request);
      // if u want to make the handler manually
      res = await handleEvent(url, request);
    }

    return res;
  } catch (error) {
    console.log("service-worker:error", error);
  }
};

async function handleEvent(url: URL, request: Request) {
  let body = undefined;
  if (request.body && request.arrayBuffer) {
    body = await request.arrayBuffer();
  }

  return await nitroApp.localFetch(url.pathname + url.search, {
    host: url.hostname,
    protocol: url.protocol,
    headers: request.headers,
    method: request.method,
    redirect: "manual",
    body,
  });
}

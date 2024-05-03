import "#internal/nitro/virtual/polyfills";
// @ts-ignore
import { isPublicAssetURL } from "#internal/nitro/virtual/public-assets";


const nitroApp = useNitroApp();


// const server = http.createServer(onRequest)

function fixAssetsUrl(inputString: string) {
  const nuxtIndex = inputString.indexOf("/_nuxt/");
  return inputString.substring(nuxtIndex);
}

// const handler = toWebHandler(nitroApp.h3App);

export default async (request: Request, env = {}, ctx: any) => {
  let url = new URL(request.url);

  if (isPublicAssetURL(url.pathname) || url.pathname.includes("/server/")) {
    return;
  }

  let res;

  // idk why but nuxt will not serve its own build assets correctly so we need to fetch them
  if (url.pathname.includes("/_nuxt/")) {
    res = await fetch(fixAssetsUrl(url.pathname));
  }

  if (!res) {
    // res = await handler(request);
    // if u want to make the handler manually
    res = await handleEvent(url, request);
  }

  const cloned = res?.clone();
  if (cloned) {
    console.log({
      contentType: cloned.headers.get("content-type"),
      url: url.pathname,
    });
  }

  return res;
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

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  //setting this in a module does not work
  app: {
    // nuxt will be reachable at /nitro/
    baseURL: "/nitro/",
    // assets will be served at / allowing socket to handle asset requests
    cdnURL: "/",
  },
});

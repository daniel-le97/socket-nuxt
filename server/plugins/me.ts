export default defineNitroPlugin((nitroApp) => {
//   function isHTML(str: string) {
//     // Regular expression to match HTML tags
//     const htmlRegex = /<\/?[a-z][\s\S]*>/i;
//     return htmlRegex.test(str);
//   }
//   nitroApp.hooks.hook("beforeResponse", (event, res) => {
//     setHeader(event, "runtime-preload-injection", "disabled");
//     if (typeof res.body === "string") {
//       if (isHTML(res.body)) {
//         setHeader(event, "runtime-preload-injection", "enabled");
//       } else {
//         setHeader(event, "Content-Type", "text/plain");
//       }
//     }
//   });
});

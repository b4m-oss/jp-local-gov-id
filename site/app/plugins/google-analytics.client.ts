export default defineNuxtPlugin(() => {
  const id = useRuntimeConfig().public.scripts?.googleAnalytics?.id;
  if (typeof id !== "string" || !id.startsWith("G-")) {
    return;
  }

  useScriptGoogleAnalytics({
    id,
    scriptOptions: {
      trigger: "onNuxtReady",
    },
  });
});

export default defineNuxtPlugin(() => {
  // Never send analytics from local `nuxt dev` / development builds.
  if (import.meta.dev) {
    return;
  }

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

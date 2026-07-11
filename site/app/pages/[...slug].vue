<script setup lang="ts">
import { withLeadingSlash } from "ufo";
import type { Collections } from "@nuxt/content";

const route = useRoute();
const { locale } = useI18n();

const slug = computed(() => {
  const raw = route.params.slug;
  if (!raw || (Array.isArray(raw) && raw.length === 0)) {
    return "/";
  }
  const joined = Array.isArray(raw) ? raw.join("/") : String(raw);
  return withLeadingSlash(joined);
});

const { data: page } = await useAsyncData(
  () => `content-${locale.value}-${slug.value}`,
  async () => {
    const collection = (`content_${locale.value}`) as keyof Collections;
    return queryCollection(collection).path(slug.value).first();
  },
  { watch: [locale, slug] },
);

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
    fatal: true,
  });
}
</script>

<template>
  <article class="prose">
    <ContentRenderer v-if="page" :value="page" />
  </article>
</template>

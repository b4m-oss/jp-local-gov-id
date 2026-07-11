<script setup lang="ts">
useHead({
  titleTemplate: (title) =>
    title
      ? `${title} :: jp-local-gov-id by Bicycle for Mind LLC`
      : "jp-local-gov-id by Bicycle for Mind LLC",
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

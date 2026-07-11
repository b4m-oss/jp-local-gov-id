<script setup lang="ts">
const { t, locale, locales, setLocale } = useI18n();
const localePath = useLocalePath();

const selected = computed({
  get: () => locale.value,
  set: (code: string) => {
    void setLocale(code);
  },
});
</script>

<template>
  <header class="header">
    <div class="header-inner">
      <NuxtLink :to="localePath('/')" class="brand">
        jp-local-gov-id
      </NuxtLink>
      <nav class="nav" aria-label="Primary">
        <NuxtLink :to="localePath('/')">{{ t("nav.home") }}</NuxtLink>
        <NuxtLink :to="localePath('/getting-started')">
          {{ t("nav.gettingStarted") }}
        </NuxtLink>
        <NuxtLink :to="localePath('/api')">{{ t("nav.api") }}</NuxtLink>
        <NuxtLink :to="localePath('/playground')">
          {{ t("nav.playground") }}
        </NuxtLink>
      </nav>
      <label class="lang">
        <span class="sr-only">{{ t("nav.language") }}</span>
        <select v-model="selected">
          <option
            v-for="item in locales"
            :key="item.code"
            :value="item.code"
          >
            {{ item.name }}
          </option>
        </select>
      </label>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  height: var(--header-height);
  backdrop-filter: blur(10px);
  background: color-mix(in srgb, var(--color-bg) 82%, white);
  border-bottom: 1px solid var(--color-border);
}

.header-inner {
  height: 100%;
  width: min(100% - 2rem, 64rem);
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.brand {
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-ink);
  text-decoration: none;
  white-space: nowrap;
}

.brand:hover {
  color: var(--color-accent);
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem 1rem;
  flex: 1;
}

.nav a {
  color: var(--color-muted);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
}

.nav a:hover,
.nav a.router-link-active {
  color: var(--color-ink);
}

.lang select {
  font: inherit;
  font-size: 0.875rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.35rem;
  background: var(--color-surface);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

@media (max-width: 640px) {
  .header {
    height: auto;
  }

  .header-inner {
    flex-wrap: wrap;
    padding: 0.75rem 0;
  }

  .nav {
    order: 3;
    width: 100%;
  }
}
</style>

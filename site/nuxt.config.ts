import { copyFileSync } from "node:fs";
import { join } from "node:path";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/content", "@nuxtjs/i18n", "@nuxtjs/color-mode"],
  devtools: { enabled: true },
  compatibilityDate: "2024-04-03",
  css: ["~/assets/css/main.css"],
  colorMode: {
    preference: "system",
    fallback: "light",
    classSuffix: "",
  },
  content: {
    // Avoid better-sqlite3 native bindings on Netlify CI (Node 22+)
    experimental: { sqliteConnector: "native" },
    build: {
      markdown: {
        highlight: {
          theme: {
            default: "github-light",
            dark: "github-dark",
          },
        },
      },
    },
  },
  app: {
    head: {
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap",
        },
      ],
    },
  },
  i18n: {
    locales: [
      { code: "ja", name: "日本語", language: "ja-JP", file: "ja.json" },
      { code: "en", name: "English", language: "en-US", file: "en.json" },
    ],
    defaultLocale: "ja",
    strategy: "prefix",
    lazy: true,
    langDir: "locales",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
      fallbackLocale: "ja",
    },
    bundle: {
      optimizeTranslationDirective: false,
    },
  },
  // public/index.html would shadow `/` in `nuxt dev` and block Nitro middleware.
  // Copy the static locale redirect page into the generate output instead.
  hooks: {
    "nitro:build:public-assets"(nitro) {
      copyFileSync(
        join(nitro.options.rootDir, "locale-root.html"),
        join(nitro.options.output.publicDir, "index.html"),
      );
    },
  },
  nitro: {
    preset: "static",
    prerender: {
      crawlLinks: true,
      routes: [
        "/ja",
        "/en",
        "/ja/playground",
        "/en/playground",
        "/ja/installation",
        "/en/installation",
        "/ja/usage",
        "/en/usage",
        "/ja/examples",
        "/en/examples",
      ],
    },
  },
})

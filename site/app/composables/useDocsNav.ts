export type DocsNavItem = {
  key: string;
  path: string;
};

export const docsNavItems: DocsNavItem[] = [
  { key: "home", path: "/" },
  { key: "gettingStarted", path: "/getting-started" },
  { key: "installation", path: "/installation" },
  { key: "usage", path: "/usage" },
  { key: "api", path: "/api" },
  { key: "examples", path: "/examples" },
  { key: "playground", path: "/playground" },
];

export function useDocsNav() {
  const { t } = useI18n();
  const localePath = useLocalePath();

  const items = computed(() =>
    docsNavItems.map((item) => ({
      ...item,
      label: t(`nav.${item.key}`),
      to: localePath(item.path),
    })),
  );

  return { items };
}

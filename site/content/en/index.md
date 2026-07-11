---
title: jp-local-gov-id
description: Japan nationwide local government codes for JavaScript
---

# jp-local-gov-id

A JavaScript API for Japan’s nationwide local government codes, with split JSON and lazy loading.

| Package | Description |
|---------|-------------|
| `@b4moss/jp-local-gov-id` | JS API (data not bundled) |
| `@b4moss/jp-local-gov-id-data` | Split JSON datasets |

```bash
npm install @b4moss/jp-local-gov-id @b4moss/jp-local-gov-id-data
```

```ts
import { createLocalGovClient } from "@b4moss/jp-local-gov-id";
import dataset from "@b4moss/jp-local-gov-id-data";

const client = await createLocalGovClient({ data: dataset });
await client.getByCode("131016"); // Chiyoda
```

- [Getting started](/en/getting-started) — install and usage
- [API](/en/api) — public methods
- [Playground](/en/playground) — try it in the browser

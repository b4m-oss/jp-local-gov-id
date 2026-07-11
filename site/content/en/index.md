---
title: jp-local-gov-id
description: An npm package for Japan’s nationwide local government codes
---

# jp-local-gov-id

A JavaScript API for working with Japan’s nationwide local government codes.

## What you can do

- List municipalities in a given prefecture
- Fetch prefecture information as a list
- Look up local government codes — unique IDs useful for address normalization

## Installation

```bash
npm install @b4moss/jp-local-gov-id @b4moss/jp-local-gov-id-data
```

See [Installation](/en/installation) for details.

## Quick example

```ts
import { createLocalGovClient } from "@b4moss/jp-local-gov-id";
import dataset from "@b4moss/jp-local-gov-id-data";

const client = await createLocalGovClient({ data: dataset });
await client.getByCode("131016"); // Chiyoda
```

See [Usage](/en/usage) for details.

## Packages

| Package | Description |
|---------|-------------|
| `@b4moss/jp-local-gov-id` | JS API (data not bundled) |
| `@b4moss/jp-local-gov-id-data` | Split JSON datasets |

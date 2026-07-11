---
title: Examples
description: Address input and municipality validation samples
---

# Examples

Interactive examples in the browser (official dataset bundled).

## Address input

Select a prefecture to load its municipalities into a dropdown. Uses `listPrefectures` and `listMunicipalitiesByPrefecture`.

`designatedCity` (`"both"` | `"city"` | `"ward"`, default `"both"`) filters designated-city bodies vs wards. Tokyo special wards are not affected.

::address-input-demo
::

```html
<label for="prefecture">Prefecture</label>
<select id="prefecture">
  <option value="">Select a prefecture</option>
  <!-- Fill options with listPrefectures() -->
</select>

<label for="designated-city">Designated city display</label>
<select id="designated-city">
  <option value="both">City and wards</option>
  <option value="city">City only</option>
  <option value="ward">Wards only</option>
</select>

<label for="municipality">Municipality</label>
<select id="municipality" disabled>
  <option value="">Select a municipality</option>
  <!-- On prefecture change, fill with listMunicipalitiesByPrefecture() -->
</select>
```

```ts
import { createLocalGovClient } from "@b4moss/jp-local-gov-id";
import type { DesignatedCityMode } from "@b4moss/jp-local-gov-id";
import dataset from "@b4moss/jp-local-gov-id-data";

const client = await createLocalGovClient({ data: dataset });

const prefSelect = document.querySelector("#prefecture");
const modeSelect = document.querySelector("#designated-city");
const muniSelect = document.querySelector("#municipality");

for (const pref of client.listPrefectures()) {
  const option = document.createElement("option");
  option.value = pref.code;
  option.textContent = pref.name;
  prefSelect.append(option);
}

async function loadMunicipalities() {
  muniSelect.replaceChildren();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a municipality";
  muniSelect.append(placeholder);

  if (!prefSelect.value) {
    muniSelect.disabled = true;
    return;
  }

  const designatedCity = modeSelect.value as DesignatedCityMode;
  const municipalities = await client.listMunicipalitiesByPrefecture(
    prefSelect.value,
    { designatedCity },
  );
  for (const muni of municipalities) {
    const option = document.createElement("option");
    option.value = muni.code;
    option.textContent = muni.name;
    muniSelect.append(option);
  }
  muniSelect.disabled = false;
}

prefSelect.addEventListener("change", loadMunicipalities);
modeSelect.addEventListener("change", loadMunicipalities);
```

## Municipality validation

With a prefecture selected, enter a municipality name and check whether it exists. Names that do not match an exact official name show an error (`getLocalGovCodeByName`).

::municipality-validation-demo
::

```html
<label for="prefecture">Prefecture</label>
<select id="prefecture">
  <option value="">Select a prefecture</option>
  <!-- Fill options with listPrefectures() -->
</select>

<label for="municipality-name">Municipality name</label>
<input id="municipality-name" type="text" placeholder="千代田区" />

<button type="button" id="validate">Validate</button>
<p id="message" hidden></p>
```

```ts
import { createLocalGovClient } from "@b4moss/jp-local-gov-id";
import dataset from "@b4moss/jp-local-gov-id-data";

const client = await createLocalGovClient({ data: dataset });

const prefSelect = document.querySelector("#prefecture");
const nameInput = document.querySelector("#municipality-name");
const message = document.querySelector("#message");

for (const pref of client.listPrefectures()) {
  const option = document.createElement("option");
  option.value = pref.code;
  option.textContent = pref.name;
  prefSelect.append(option);
}

document.querySelector("#validate").addEventListener("click", async () => {
  const code = await client.getLocalGovCodeByName(nameInput.value.trim(), {
    prefecture: prefSelect.value,
    target: "cities",
  });

  message.hidden = false;
  if (code === null) {
    message.textContent = "This municipality name does not exist";
  } else {
    message.textContent = `Valid (code: ${code})`;
  }
});
```

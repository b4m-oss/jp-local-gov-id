---
title: サンプル
description: 住所入力・市区町村バリデーションの利用例
---

# サンプル

ブラウザ上で動かせる利用例です（公式データセットを同梱）。

## 住所入力

都道府県を選ぶと、配下の市区町村がプルダウンに読み込まれます。`listPrefectures` と `listMunicipalitiesByPrefecture` を使っています。

::address-input-demo
::

```html
<label for="prefecture">都道府県</label>
<select id="prefecture">
  <option value="">選択してください</option>
  <!-- listPrefectures() の結果で option を埋める -->
</select>

<label for="municipality">市区町村</label>
<select id="municipality" disabled>
  <option value="">選択してください</option>
  <!-- 都道府県変更時に listMunicipalitiesByPrefecture() で option を埋める -->
</select>
```

```ts
import { createLocalGovClient } from "@b4moss/jp-local-gov-id";
import dataset from "@b4moss/jp-local-gov-id-data";

const client = await createLocalGovClient({ data: dataset });

const prefSelect = document.querySelector("#prefecture");
const muniSelect = document.querySelector("#municipality");

for (const pref of client.listPrefectures()) {
  const option = document.createElement("option");
  option.value = pref.code;
  option.textContent = pref.name;
  prefSelect.append(option);
}

prefSelect.addEventListener("change", async () => {
  muniSelect.replaceChildren();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "選択してください";
  muniSelect.append(placeholder);

  if (!prefSelect.value) {
    muniSelect.disabled = true;
    return;
  }

  const municipalities = await client.listMunicipalitiesByPrefecture(
    prefSelect.value,
  );
  for (const muni of municipalities) {
    const option = document.createElement("option");
    option.value = muni.code;
    option.textContent = muni.name;
    muniSelect.append(option);
  }
  muniSelect.disabled = false;
});
```

## 市区町村バリデーション

都道府県を選んだうえで市区町村名を入力し、実在するか検証します。正式名称に一致しない場合はエラーになります（`getLocalGovCodeByName`）。

::municipality-validation-demo
::

```html
<label for="prefecture">都道府県</label>
<select id="prefecture">
  <option value="">選択してください</option>
  <!-- listPrefectures() の結果で option を埋める -->
</select>

<label for="municipality-name">市区町村名</label>
<input id="municipality-name" type="text" placeholder="千代田区" />

<button type="button" id="validate">検証</button>
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
    message.textContent = "存在しない市区町村名です";
  } else {
    message.textContent = `有効です（コード: ${code}）`;
  }
});
```

/** 都道府県コード入力を 2 桁に正規化する。無効なら null */
export function normalizePrefectureCode(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length < 1 || digits.length > 2) return null;
  return digits.padStart(2, "0");
}

/**
 * 全国地方公共団体コードの検査数字を検証する（先頭 5 桁 + 検査数字 1 桁）。
 * 重み 6,5,4,3,2 → 和を 11 で割った余り r について (11 - r) % 10。
 */
export function hasValidCheckDigit(code6: string): boolean {
  if (!/^\d{6}$/.test(code6)) return false;
  const weights = [6, 5, 4, 3, 2] as const;
  let sum = 0;
  for (let i = 0; i < 5; i++) {
    sum += Number(code6[i]) * weights[i]!;
  }
  const check = (11 - (sum % 11)) % 10;
  return check === Number(code6[5]);
}

/** 市区町村コードとして桁数・チェックデジットが正しければ true */
export function isValidMunicipalityCode(input: string): boolean {
  return normalizeMunicipalityCode(input) !== null;
}

/** getByCode 用: 2 桁都道府県 or 6 桁市区町村。それ以外は null */
export function normalizeLookupCode(
  input: string,
):
  | { kind: "prefecture"; code: string }
  | { kind: "municipality"; code: string }
  | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 1 || digits.length === 2) {
    return { kind: "prefecture", code: digits.padStart(2, "0") };
  }
  if (digits.length === 6 && hasValidCheckDigit(digits)) {
    return { kind: "municipality", code: digits };
  }
  return null;
}

/** 市区町村コード（6 桁・チェックデジット有効）のみ。それ以外は null */
export function normalizeMunicipalityCode(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length !== 6 || !hasValidCheckDigit(digits)) return null;
  return digits;
}

/**
 * 検索比較用: ひらがな→カタカナ、全角カナ→半角カナ。
 * 漢字などはそのまま残す。
 */
export function normalizeSearchText(input: string): string {
  let out = "";
  for (const ch of input) {
    const code = ch.codePointAt(0);
    if (code === undefined) continue;

    // Hiragana → Katakana
    if (code >= 0x3041 && code <= 0x3096) {
      out += String.fromCodePoint(code + 0x60);
      continue;
    }

    out += ch;
  }

  return toHalfwidthKatakana(out);
}

/** Fullwidth katakana (and voiced marks) → halfwidth. */
function toHalfwidthKatakana(input: string): string {
  const base: Record<string, string> = {
    ア: "ｱ",
    イ: "ｲ",
    ウ: "ｳ",
    エ: "ｴ",
    オ: "ｵ",
    カ: "ｶ",
    キ: "ｷ",
    ク: "ｸ",
    ケ: "ｹ",
    コ: "ｺ",
    サ: "ｻ",
    シ: "ｼ",
    ス: "ｽ",
    セ: "ｾ",
    ソ: "ｿ",
    タ: "ﾀ",
    チ: "ﾁ",
    ツ: "ﾂ",
    テ: "ﾃ",
    ト: "ﾄ",
    ナ: "ﾅ",
    ニ: "ﾆ",
    ヌ: "ﾇ",
    ネ: "ﾈ",
    ノ: "ﾉ",
    ハ: "ﾊ",
    ヒ: "ﾋ",
    フ: "ﾌ",
    ヘ: "ﾍ",
    ホ: "ﾎ",
    マ: "ﾏ",
    ミ: "ﾐ",
    ム: "ﾑ",
    メ: "ﾒ",
    モ: "ﾓ",
    ヤ: "ﾔ",
    ユ: "ﾕ",
    ヨ: "ﾖ",
    ラ: "ﾗ",
    リ: "ﾘ",
    ル: "ﾙ",
    レ: "ﾚ",
    ロ: "ﾛ",
    ワ: "ﾜ",
    ヲ: "ｦ",
    ン: "ﾝ",
    ァ: "ｧ",
    ィ: "ｨ",
    ゥ: "ｩ",
    ェ: "ｪ",
    ォ: "ｫ",
    ッ: "ｯ",
    ャ: "ｬ",
    ュ: "ｭ",
    ョ: "ｮ",
    ー: "ｰ",
    "・": "･",
    "゛": "ﾞ",
    "゜": "ﾟ",
  };

  const voiced: Record<string, string> = {
    ガ: "ｶﾞ",
    ギ: "ｷﾞ",
    グ: "ｸﾞ",
    ゲ: "ｹﾞ",
    ゴ: "ｺﾞ",
    ザ: "ｻﾞ",
    ジ: "ｼﾞ",
    ズ: "ｽﾞ",
    ゼ: "ｾﾞ",
    ゾ: "ｿﾞ",
    ダ: "ﾀﾞ",
    ヂ: "ﾁﾞ",
    ヅ: "ﾂﾞ",
    デ: "ﾃﾞ",
    ド: "ﾄﾞ",
    バ: "ﾊﾞ",
    ビ: "ﾋﾞ",
    ブ: "ﾌﾞ",
    ベ: "ﾍﾞ",
    ボ: "ﾎﾞ",
    パ: "ﾊﾟ",
    ピ: "ﾋﾟ",
    プ: "ﾌﾟ",
    ペ: "ﾍﾟ",
    ポ: "ﾎﾟ",
    ヴ: "ｳﾞ",
  };

  let out = "";
  for (const ch of input) {
    if (voiced[ch]) {
      out += voiced[ch];
    } else if (base[ch]) {
      out += base[ch];
    } else {
      out += ch;
    }
  }
  return out;
}

/** 都道府県コード入力を 2 桁に正規化する。無効なら null */
export function normalizePrefectureCode(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length < 1 || digits.length > 2) return null;
  return digits.padStart(2, "0");
}

/** getByCode 用: 2 桁都道府県 or 6 桁市区町村。それ以外は null */
export function normalizeLookupCode(
  input: string,
): { kind: "prefecture"; code: string } | { kind: "municipality"; code: string } | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 1 || digits.length === 2) {
    return { kind: "prefecture", code: digits.padStart(2, "0") };
  }
  if (digits.length === 6) {
    return { kind: "municipality", code: digits };
  }
  return null;
}

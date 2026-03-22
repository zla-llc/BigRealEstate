export type NumOrStr = number | string;

export const numStrToNum = (v: NumOrStr) =>
  Math.round(typeof v === "string" ? parseFloat(v) : v);

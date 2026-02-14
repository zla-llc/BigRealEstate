const english_ordinal_rules = new Intl.PluralRules("en", { type: "ordinal" });
const suffixes = {
  one: "st",
  two: "nd",
  few: "rd",
  other: "th",
};

export const ordinals = (num: number) => {
  const category = english_ordinal_rules.select(num);
  const suffix = suffixes[category as keyof typeof suffixes];
  return num + suffix;
};

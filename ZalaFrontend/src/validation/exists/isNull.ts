export const isNull = (value: unknown) => value === null;

export const isUndefined = (value: unknown) => value === undefined;

export const isDefined = (value: unknown) =>
  !isNull(value) && !isUndefined(value);

export const useOverflow = (
  max: number,
  actual: number,
  forceActual: boolean = false,
) => {
  const overflowAmount = actual - max;
  const sliceCount = !forceActual && overflowAmount > 0 ? max - 1 : actual;

  // To hide the overflow count when appropriate and show the correct # of overflow when there is any overflow we add one because we hide the amount of overflow plus one extra to account for the number circle showing the overflow count
  const displayOverflow = forceActual
    ? 0
    : overflowAmount > 0
      ? overflowAmount + 1
      : overflowAmount;
  return [overflowAmount, sliceCount, displayOverflow];
};

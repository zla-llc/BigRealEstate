import React, { useEffect } from "react";
import { useDimensions, type IScreenDimensions } from "./useDimensions";
import { useIsVisible } from "./useIsVisible";

type UseVisibleDimsResult = [
  React.RefObject<HTMLDivElement | null>,
  IScreenDimensions,
  boolean,
  number,
  React.Dispatch<React.SetStateAction<IScreenDimensions>>,
] & {
  ref: React.RefObject<HTMLDivElement | null>;
  dims: IScreenDimensions;
  isVisible: boolean;
  changeCount: number;
  setDims: React.Dispatch<React.SetStateAction<IScreenDimensions>>;
};

export const useVisibleDims = (): UseVisibleDimsResult => {
  const { ref, dims, setDims, changeCount, setChangeCount } = useDimensions();
  const isVisible = useIsVisible(ref);
  const result = [
    ref,
    dims,
    isVisible,
    changeCount,
    setDims,
  ] as UseVisibleDimsResult;

  useEffect(() => {
    setChangeCount((prev) => prev + 1);
  }, [isVisible]);

  result.ref = ref;
  result.dims = dims;
  result.isVisible = isVisible;
  result.changeCount = changeCount;
  result.setDims = setDims;

  return result;
};

import React, { useEffect, useRef, useState } from "react";
import { type NumOrStr } from "../../utils";
import { throttle } from "lodash";

export type IDimensions = {
  width: NumOrStr;
  height: NumOrStr;
  x: NumOrStr;
  y: NumOrStr;
};

export type IScreenDimensions = IDimensions & {
  screenX: NumOrStr;
  screenY: NumOrStr;
};

export type IDimensionsCSS = {
  width: number | string;
  height: number | string;
  top: number | string;
  left: number | string;
  right?: number | string;
  bottom?: number | string;
};

const DEFAULT_DIMENSIONS: IScreenDimensions = {
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  screenX: 0,
  screenY: 0,
};

// const debounce = (func: (...args: unknown[]) => void, delay: number) => {
//   let timeoutId: number;
//   return function (...args: unknown[]) {
//     if (timeoutId) {
//       clearTimeout(timeoutId);
//     }
//     timeoutId = setTimeout(() => {
//       func(...args);
//     }, delay);
//   };
// };

type UseDimensionsResponse = [
  React.RefObject<HTMLDivElement | null>,
  IScreenDimensions,
  React.Dispatch<React.SetStateAction<IScreenDimensions>>,
  number,
] & {
  ref: React.RefObject<HTMLDivElement | null>;
  dims: IScreenDimensions;
  setDims: React.Dispatch<React.SetStateAction<IScreenDimensions>>;
  changeCount: number;
  setChangeCount: React.Dispatch<React.SetStateAction<number>>;
};

export const useDimensions = (): UseDimensionsResponse => {
  const elementRef = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] =
    useState<IScreenDimensions>(DEFAULT_DIMENSIONS);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const observer = getObserver();

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    // Cleanup on component unmount
    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [elementRef.current]);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
    };
  }, []);

  const onScroll = throttle(() => {
    updateDimensions();
  }, 10);

  const getObserver = () =>
    new ResizeObserver((_entries) => {
      // Only interested in the first entry for the observed element
      updateDimensions();
    });

  const updateDimensions = () => {
    if (!elementRef.current) return;

    const boundingRect = elementRef.current.getBoundingClientRect();
    const { top, left, width, height, x, y } = boundingRect;

    setDimensions({ width, height, x, y, screenX: left, screenY: top });
    setCount((prev) => prev + 1);
  };

  const res = [
    elementRef,
    dimensions,
    setDimensions,
    count,
  ] as UseDimensionsResponse;

  res.ref = elementRef;
  res.dims = dimensions;
  res.setDims = setDimensions;
  res.changeCount = count;
  res.setChangeCount = setCount;

  return res;
};

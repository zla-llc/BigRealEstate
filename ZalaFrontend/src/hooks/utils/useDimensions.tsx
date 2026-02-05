import React, { useEffect, useRef, useState } from "react";
import { type NumOrStr } from "../../utils";

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

export const useDimensions = (): [
  React.RefObject<HTMLDivElement | null>,
  IScreenDimensions,
  React.Dispatch<React.SetStateAction<IScreenDimensions>>,
] => {
  const elementRef = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] =
    useState<IScreenDimensions>(DEFAULT_DIMENSIONS);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      // Only interested in the first entry for the observed element
      if (elementRef.current && entries[0]) {
        const { width, height, x, y } = entries[0].contentRect;
        const boundingRect = elementRef.current.getBoundingClientRect();
        const { top, left } = boundingRect;

        setDimensions({ width, height, x, y, screenX: left, screenY: top });
      }
    });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    // Cleanup on component unmount
    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  return [elementRef, dimensions, setDimensions];
};

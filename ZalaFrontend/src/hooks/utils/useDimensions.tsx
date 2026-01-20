import React, { useEffect, useRef, useState } from "react";
import { type NumOrStr } from "../../utils";

export type IDimensions = {
  width: NumOrStr;
  height: NumOrStr;
  x: NumOrStr;
  y: NumOrStr;
};

export type IDimensionsCSS = {
  width: number | string;
  height: number | string;
  top: number | string;
  left: number | string;
  right?: number | string;
  bottom?: number | string;
};

const DEFAULT_DIMENSIONS: IDimensions = {
  width: 0,
  height: 0,
  x: 0,
  y: 0,
};

export const useDimensions = (): [
  React.RefObject<HTMLDivElement | null>,
  IDimensions,
  React.Dispatch<React.SetStateAction<IDimensions>>
] => {
  const elementRef = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState<IDimensions>(DEFAULT_DIMENSIONS);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      // Only interested in the first entry for the observed element
      if (entries[0]) {
        const { width, height, x, y } = entries[0].contentRect;

        setDimensions({ width, height, x, y });
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

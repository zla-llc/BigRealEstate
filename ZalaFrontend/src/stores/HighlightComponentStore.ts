import { create } from "zustand";
import type { IHighlightComponentDims } from "../hooks";
import type { ReactNode } from "react";

export enum TextPlacement {
  Top = "Top",
  Left = "Left",
  Right = "Right",
  Bottom = "Bottom",
}

type IHighlightComponentStore = {
  highlightComponentDims: (IHighlightComponentDims | null)[];
  setHighlightComponentDims: (
    highlightComponentDims: (IHighlightComponentDims | null)[],
  ) => void;

  // dimsChange: number[];
  // setDimsChange: (dimsChange: number[]) => void;

  components: ((() => ReactNode) | null)[];
  setComponents: (components: ((() => ReactNode) | null)[]) => void;

  textPlacement: TextPlacement[];
  setTextPlacement: (textPlacement: TextPlacement[]) => void;
};

export const useHighlightComponentStore = create<IHighlightComponentStore>()(
  (set) => ({
    highlightComponentDims: [],
    setHighlightComponentDims: (highlightComponentDims) =>
      set({ highlightComponentDims }),

    // dimsChange: [],
    // setDimsChange: (dimsChange) => set({ dimsChange }),

    components: [],
    setComponents: (components) => set({ components }),

    textPlacement: [],
    setTextPlacement: (textPlacement) => set({ textPlacement }),
  }),
);

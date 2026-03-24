import type React from "react";
import type { IScreenDimensions } from "../hooks";
import { create } from "zustand";

export enum CustomTooltipAlignment {
  TL = "Top Left",
  TC = "Top Center",
  TR = "Top Right",

  BL = "Bottom Left",
  BC = "Bottom Center",
  BR = "Bottom Right",
}

type CustomTooltipStore = {
  child: React.ReactNode;
  setChild: (child: React.ReactNode) => void;

  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;

  targetElement: IScreenDimensions;
  setTargetElement: (targetElement: IScreenDimensions) => void;

  alignment: CustomTooltipAlignment;
  setAlignment: (alignment: CustomTooltipAlignment) => void;
};

export const useCustomTooltipStore = create<CustomTooltipStore>()(
  (set, get) => ({
    child: null,
    setChild: (child) => set({ child }),
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    toggle: () => set({ isOpen: !get().isOpen }),
    targetElement: {
      y: 0,
      x: 0,
      width: 0,
      height: 0,
      screenX: 0,
      screenY: 0,
    },
    setTargetElement: (targetElement) => set({ targetElement }),
    alignment: CustomTooltipAlignment.TR,
    setAlignment: (alignment) => set({ alignment }),
  }),
);

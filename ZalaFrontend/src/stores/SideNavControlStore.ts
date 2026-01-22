import { create } from "zustand";

export enum SideNavControlVariant {
  LeadFilters = "LeadFilters",
  BoardSettings = "BoardSettings",
  None = "None",
}

export enum SidenavSideEnum {
  Left = "Left",
  Right = "Right",
}

type ISideNavControlStore = {
  isOpen: boolean;
  variant: SideNavControlVariant;
  timeout: number | undefined;

  side: SidenavSideEnum;
  setSide: (v: SidenavSideEnum) => void;

  open: (variant: SideNavControlVariant) => void;
  close: () => void;
};

export const useSideNavControlStore = create<ISideNavControlStore>()(
  (set, vals) => ({
    isOpen: false,
    variant: SideNavControlVariant.None,
    timeout: undefined,

    side: SidenavSideEnum.Left,
    setSide: (side) => set({ side }),

    open: (variant) => set({ isOpen: true, variant }),
    close: () => {
      const currVals = vals();
      if (currVals.timeout) clearTimeout(currVals.timeout);
      const timeout = setTimeout(() => {
        set({
          variant: SideNavControlVariant.None,
          timeout: undefined,
          side: SidenavSideEnum.Left,
        });
      }, 500); // Wait for animation to run before removing sidenav content
      set({ isOpen: false, timeout });
    },
  })
);

import { create } from "zustand";

type IAllowScrollStore = {
  isScrollable: boolean;
  setIsScrollable: (isScrollable: boolean) => void;
  toggleScrollable: (isScrollable?: boolean) => void;
};

export const useAllowScrollStore = create<IAllowScrollStore>()((set, get) => ({
  isScrollable: true,
  setIsScrollable: (isScrollable) => set({ isScrollable }),
  toggleScrollable: (isScrollable) =>
    set({
      isScrollable:
        isScrollable !== undefined ? isScrollable : !get().isScrollable,
    }),
}));

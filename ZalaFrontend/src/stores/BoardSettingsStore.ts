import { create } from "zustand";
import type { IBoardType } from "../interfaces";

type IBoardSettingsStore = {
  boardName: string;
  setBoardName: (v: string) => void;

  boardType: IBoardType;
  setBoardType: (v: IBoardType) => void;

  boardTypeDisabled: boolean;
  setBoardTypeDisabled: (v: boolean) => void;

  onSave: () => void;
  setOnSave: (v: () => void) => void;
};

export const useBoardSettingsStore = create<IBoardSettingsStore>()((set) => ({
  boardName: "",
  setBoardName: (boardName) => set({ boardName }),

  boardType: "properties",
  setBoardType: (boardType) => set({ boardType }),

  boardTypeDisabled: false,
  setBoardTypeDisabled: (boardTypeDisabled) => set({ boardTypeDisabled }),

  onSave: () => {},
  setOnSave: (onSave) => set({ onSave }),
}));

import { create } from "zustand";
import type { LeaderboardItem } from "../interfaces";

type ILeaderboardModalStore = {
  title: string;
  items: LeaderboardItem[];

  setTitle: (title: string) => void;
  setItems: (items: LeaderboardItem[]) => void;

  onItemClick: (itemId: number) => void;
  setOnItemClick: (onItemClick: (itemId: number) => void) => void;
};

export const useLeaderboardModalStore = create<ILeaderboardModalStore>()(
  (set) => ({
    title: "",
    items: [],

    setTitle: (title) => set({ title }),
    setItems: (items) => set({ items }),

    onItemClick: () => {},
    setOnItemClick: (onItemClick) => set({ onItemClick }),
  }),
);

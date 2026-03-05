import { create } from "zustand";

export enum TutorialPage {
  Dashboard = "Dashboard",
}

type ITutorialStore = {
  page: TutorialPage;

  setPage: (page: TutorialPage) => void;
};

export const useTutorialStore = create<ITutorialStore>()((set) => ({
  page: TutorialPage.Dashboard,

  setPage: (page) => set({ page }),
}));

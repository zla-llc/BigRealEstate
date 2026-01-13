import { create } from "zustand";

export enum BoardModalPage {
  MethodSelectPage = "MethodSelectPage",

  CampaignSelectPage = "CampaignSelectPage",
  CampaignLeadSelectPage = "CampaignLeadSelectPage",
  CampaignLeadDetailsPage = "CampaignLeadDetailsPage",

  // Likely will want a property select page for allready created properties
  PropertySelectPage = "PropertySelectPage",

  ImportLeadsPage = "ImportLeadsPage",

  ManualLeadPage = "ManualLeadPage",
  ManualPropertyPage = "ManualPropertyPage",
}

type IBoardModalControlStore = {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggleOpen: () => void;

  page: BoardModalPage;
  setPage: (v: BoardModalPage) => void;

  history: BoardModalPage[];
  setHistory: (v: BoardModalPage[]) => void;
  historyPop: () => BoardModalPage | undefined;
};

export const useBoardModalControlStore = create<IBoardModalControlStore>()(
  (set, get) => ({
    open: false,
    setOpen: (open: boolean) => set({ open }),
    toggleOpen: () => set({ open: !get().open }),

    page: BoardModalPage.MethodSelectPage,
    setPage: (page: BoardModalPage) => set({ page }),

    history: [],
    setHistory: (history) => set({ history }),
    historyPop: () => {
      const history = get().history;
      const lastPage = history.pop();
      set({ history });
      return lastPage;
    },
  })
);

import { create } from "zustand";

type IAddBoardStepLeadStore = {
  selectedBoardItemIds: number[];
  setSelectedBoardItemIds: (v: number[]) => void;

  editBoardItemId: number;
  setEditBoardItemId: (v: number) => void;

  resetAllState: () => void;
};

export const useAddBoardStepLeadStore = create<IAddBoardStepLeadStore>()(
  (set, get) => ({
    selectedBoardItemIds: [],
    setSelectedBoardItemIds: (selectedBoardItemIds) =>
      set({ selectedBoardItemIds }),

    editBoardItemId: -1,
    setEditBoardItemId: (editBoardItemId) => set({ editBoardItemId }),

    resetAllState: () => (get(), set({ selectedBoardItemIds: [] })),
  })
);

import { produce } from "immer";
import { create } from "zustand";

type ISelectedIdsStoreState = {
  properties: number[];
  boards: number[];
};

type SelectedIdsStoreStateKeys = keyof ISelectedIdsStoreState;

type ISelectedIdsStore = ISelectedIdsStoreState & {
  toggleSelected: (key: SelectedIdsStoreStateKeys, id: number) => void;
  clearSelected: (key: SelectedIdsStoreStateKeys) => void;
};

export const useSelectedIdsStore = create<ISelectedIdsStore>()((set, get) => ({
  properties: [],
  boards: [],

  toggleSelected: (key, id) => {
    set(
      produce(get(), (draft) => {
        const exists = draft[key].includes(id);
        if (exists) draft[key] = draft[key].filter((checkId) => checkId !== id);
        else draft[key].push(id);
      }),
    );
  },
  clearSelected: (key) => {
    set(
      produce(get(), (draft) => {
        draft[key] = [];
      }),
    );
  },
}));

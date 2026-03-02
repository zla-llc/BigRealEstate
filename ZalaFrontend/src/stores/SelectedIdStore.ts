import { produce } from "immer";
import { create } from "zustand";

type ISelectedIdState = {
  propertyId: number;
  boardId: number;
  teamId: number;
  leadId: number;
};

type SelectedIdStoreStateKeys = keyof ISelectedIdState;

type ISelectedIdStore = ISelectedIdState & {
  setId: (key: SelectedIdStoreStateKeys, value: number) => void;
  clearId: (key: SelectedIdStoreStateKeys) => void;
};

export const useSelectedIdStore = create<ISelectedIdStore>()((set, get) => ({
  propertyId: -1,
  boardId: -1,
  teamId: -1,
  leadId: -1,

  setId: (key, value) =>
    set(
      produce(get(), (draft) => {
        draft[key] = value;
        console.log(`New val: ${key} = ${value}`);
      }),
    ),
  clearId: (key) => get().setId(key, -1),
}));

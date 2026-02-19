import { produce } from "immer";
import { create } from "zustand";

type IEditingFormStoreIds = {
  announcementId: number;
};

type IEditingFormStoreKeys = keyof IEditingFormStoreIds;

type IEditingFormStore = IEditingFormStoreIds & {
  setKey: (key: IEditingFormStoreKeys, value: number) => void;
  clearKey: (key: IEditingFormStoreKeys) => void;
  clearAll: () => void;
};

export const useEditingFormStore = create<IEditingFormStore>()((set, get) => ({
  announcementId: -1,
  setKey: (key, value) =>
    set(
      produce(get(), (draft) => {
        draft[key] = value;
      }),
    ),
  clearKey: (key) => get().setKey(key, -1),
  clearAll: () => {
    const state = get();
    state.clearKey("announcementId");
  },
}));

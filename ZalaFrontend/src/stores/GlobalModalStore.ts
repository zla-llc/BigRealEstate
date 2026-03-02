import { produce } from "immer";
import { create } from "zustand";

export enum GlobalModalPage {
  None = "None",
  ViewProperty = "ViewProperty",
  EditProperty = "EditProperty",
  CreateProperty = "CreateProperty",
}

type IListener = () => Promise<void> | void;

type IGlobalModalStoreListeners = {
  preClose?: IListener;
  postClose?: IListener;
};

type IGlobalModalStoreListenerKeys = keyof IGlobalModalStoreListeners;

type IGlobalModalStore = IGlobalModalStoreListeners & {
  page: GlobalModalPage;
  isOpen: boolean;

  toggleOpen: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setPage: (page: GlobalModalPage) => void;

  setListener: (
    key: IGlobalModalStoreListenerKeys,
    listner?: IListener,
  ) => void;
  clearListeners: () => void;
};

export const useGlobalModalStore = create<IGlobalModalStore>()((set, get) => ({
  page: GlobalModalPage.None,
  isOpen: false,

  toggleOpen: () => set({ isOpen: !get().isOpen }),
  setIsOpen: (isOpen) => set({ isOpen }),
  setPage: (page) => set({ page }),

  setListener: (key, listner) =>
    set(
      produce(get(), (draft) => {
        draft[key] = listner;
      }),
    ),
  clearListeners: () => set({ preClose: undefined, postClose: undefined }),
}));

import { create } from "zustand";
import type { ModalButtonProps } from "../components";
import { produce } from "immer";

type IViewPropertyModalControlButtons = {
  primaryBtn?: ModalButtonProps;
  secondaryBtn?: ModalButtonProps;
};

type IViewPropertyModalControlButtonKeys =
  keyof IViewPropertyModalControlButtons;

type IViewPropertyModalControlStore = IViewPropertyModalControlButtons & {
  title: string;
  isClosed: boolean;

  onEdit?: () => void;

  setTitle: (title: string) => void;
  setIsClosed: (isClosed: boolean) => void;
  setOnEdit: (onEdit?: () => void) => void;

  setActionBtn: (
    key: IViewPropertyModalControlButtonKeys,
    btn?: ModalButtonProps,
  ) => void;
  clearActionBtn: (key: IViewPropertyModalControlButtonKeys) => void;
};

export const useViewPropertyModalControlStore =
  create<IViewPropertyModalControlStore>()((set, get) => ({
    title: "",
    isClosed: false,

    setTitle: (title) => set({ title }),
    setIsClosed: (isClosed) => set({ isClosed }),
    setOnEdit: (onEdit) => set({ onEdit }),

    setActionBtn: (key, btn) =>
      set(
        produce(get(), (draft) => {
          draft[key] = btn;
        }),
      ),
    clearActionBtn: (key) => get().setActionBtn(key, undefined),
  }));

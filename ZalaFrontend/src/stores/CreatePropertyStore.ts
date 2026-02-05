import { create } from "zustand";
import type { IProperty } from "../interfaces";

type ICreatePropertyStore = {
  editingProperty: IProperty | undefined;
  setEditingProperty: (editingProperty?: IProperty) => void;
};

export const useCreatePropertyStore = create<ICreatePropertyStore>()((set) => ({
  editingProperty: undefined,
  setEditingProperty: (editingProperty) => set({ editingProperty }),
}));

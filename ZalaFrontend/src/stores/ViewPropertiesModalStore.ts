import { create } from "zustand";
import type { IProperty } from "../interfaces";
import type { ModalButtonProps } from "../components";

type IViewPropertiesModalStore = {
  properties: IProperty[];
  setProperties: (properties: IProperty[]) => void;

  title: string | undefined;
  setTitle: (title?: string) => void;

  onClick: (propertyId: number) => void;
  setOnClick: (onClick: (propertyId: number) => void) => void;

  primarySubmit?: ModalButtonProps;
  secondarySubmit?: ModalButtonProps;
  setSubmitButtons: (
    primary?: ModalButtonProps,
    secondary?: ModalButtonProps,
  ) => void;
};

export const useViewPropertiesModalStore = create<IViewPropertiesModalStore>()(
  (set) => ({
    properties: [],
    setProperties: (properties) => set({ properties }),

    title: undefined,
    setTitle: (title) => set({ title }),

    onClick: () => {},
    setOnClick: (onClick) => set({ onClick }),

    primarySubmit: undefined,
    secondarySubmit: undefined,
    setSubmitButtons: (primary, secondary) =>
      set({ primarySubmit: primary, secondarySubmit: secondary }),
  }),
);

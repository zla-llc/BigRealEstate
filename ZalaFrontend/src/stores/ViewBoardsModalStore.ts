import { create } from "zustand";
import type { IKanbanBoard } from "../interfaces";
import type { ModalButtonProps } from "../components";

type IViewBoardsModalStore = {
  boards: IKanbanBoard[];
  setBoards: (boards: IKanbanBoard[]) => void;

  title: string | undefined;
  setTitle: (title?: string) => void;

  onClick: (boardId: number) => void;
  setOnClick: (onClick: (boardId: number) => void) => void;

  primarySubmit?: ModalButtonProps;
  secondarySubmit?: ModalButtonProps;
  setSubmitButtons: (
    primary?: ModalButtonProps,
    secondary?: ModalButtonProps,
  ) => void;
};

export const useViewBoardsModalStore = create<IViewBoardsModalStore>()(
  (set) => ({
    boards: [],
    setBoards: (boards) => set({ boards }),

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

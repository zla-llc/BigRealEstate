import { create } from "zustand";
import type { IKanbanBoard } from "../interfaces";

type IViewBoardsModalStore = {
  boards: IKanbanBoard[];
  setBoards: (boards: IKanbanBoard[]) => void;

  title: string | undefined;
  setTitle: (title?: string) => void;

  onClick: (boardId: number) => void;
  setOnClick: (onClick: (boardId: number) => void) => void;
};

export const useViewBoardsModalStore = create<IViewBoardsModalStore>()(
  (set) => ({
    boards: [],
    setBoards: (boards) => set({ boards }),

    title: undefined,
    setTitle: (title) => set({ title }),

    onClick: () => {},
    setOnClick: (onClick) => set({ onClick }),
  }),
);

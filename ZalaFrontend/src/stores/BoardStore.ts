import { create } from "zustand";
import type { IBoardStepCard, IKanbanBoard } from "../interfaces";

export type IBoardStore = {
  board?: IKanbanBoard;
  setBoard: (v?: IKanbanBoard) => void;

  step?: IBoardStepCard;
  setStep: (v?: IBoardStepCard) => void;
};

export const useBoardStore = create<IBoardStore>()((set) => ({
  board: undefined,
  setBoard: (board) => set({ board }),

  step: undefined,
  setStep: (step) => set({ step }),
}));

import React, { useEffect, useState } from "react";
import {
  AKanbanBoardToIKanbanBoard,
  type IKanbanBoard,
} from "../../interfaces";
import { useApi } from "./useApi";

export const useGetBoard = ({
  boardId,
}: {
  boardId: number;
}): [
  IKanbanBoard | undefined,
  React.Dispatch<React.SetStateAction<IKanbanBoard | undefined>>,
  (boardId: number) => Promise<void>,
] => {
  const api = useApi();

  const [board, setBoard] = useState<IKanbanBoard | undefined>(undefined);

  useEffect(() => {
    if (boardId !== -1) getBoard(boardId);
  }, [boardId]);

  const getBoard = async (boardId: number) => {
    const res = await api.getBoard({ boardId });
    if (res.data) {
      setBoard(AKanbanBoardToIKanbanBoard(res.data));
    }
  };

  return [board, setBoard, getBoard];
};

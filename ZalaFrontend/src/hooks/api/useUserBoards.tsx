import React, { useEffect, useState } from "react";
import { useAllBoardsPage } from "../pages";
import type { IKanbanBoard } from "../../interfaces";

export const useUserBoards = ({
  userId,
  deps = [],
}: {
  userId: number;
  deps?: unknown[];
}): [
  IKanbanBoard[],
  React.Dispatch<React.SetStateAction<IKanbanBoard[]>>,
  (userId: number) => void,
] => {
  const { boards, getBoards } = useAllBoardsPage();

  const [userBoards, setUserBoards] = useState<IKanbanBoard[]>([]);

  useEffect(() => {
    findUserBoards(userId);
  }, [userId, boards.length, ...deps]);

  const findUserBoards = async (userId: number) => (
    await getBoards(),
    setUserBoards(boards.filter((board) => board.userId === userId))
  );

  return [userBoards, setUserBoards, findUserBoards];
};

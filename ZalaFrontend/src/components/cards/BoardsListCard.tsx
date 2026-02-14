import { DashboardCard, type DashboardCardProps } from "./DashboardCard";
import type { IKanbanBoard } from "../../interfaces";

import { BoardCardV2 } from "./BoardCardV2";

type BoardsListCardProps = DashboardCardProps & {
  boards: IKanbanBoard[];
  overflowCount?: number;
  onClick?: (boardId: number) => void;
};

export const BoardsListCard = (props: BoardsListCardProps) => {
  const { boards, overflowCount = 0, onClick = () => {} } = props;
  return (
    <DashboardCard {...props}>
      <div className="flex flex-col gap-y-[30px]">
        {boards.map((board) => (
          <BoardCardV2
            key={board.boardId}
            board={board}
            onClick={() => onClick(board.boardId)}
          />
        ))}
      </div>

      {overflowCount > 0 ? (
        <div className="flex justify-center items-center">
          + {overflowCount} More
        </div>
      ) : (
        <div />
      )}
    </DashboardCard>
  );
};

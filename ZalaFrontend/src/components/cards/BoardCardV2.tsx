import { useBoardCard } from "../../hooks";
import type { IKanbanBoard } from "../../interfaces";
import clsx from "clsx";

type BoardCardV2Props = {
  board: IKanbanBoard;
  onClick?: () => void;
};

export const BoardCardV2 = ({ board, onClick }: BoardCardV2Props) => {
  const { steps } = useBoardCard({
    board,
    expandable: undefined,
  });
  return (
    <div
      onClick={onClick}
      className={clsx(
        "flex flex-col card-base-secondary box-shadow p-[15px] space-y-[30px]",
        onClick ? "cursor-pointer hover:-translate-y-[5px] duration-75" : "",
      )}
    >
      <p className="text-lg">{board.boardName}</p>
      <div className="flex flex-row gap-x-[15px]">
        {steps.map((step) => (
          <div
            key={step.boardStepId}
            className="flex-1 h-[15px] bg-secondary-50/50 rounded-2xl"
          />
        ))}
      </div>
    </div>
  );
};

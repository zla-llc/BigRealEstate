import { EditablePageHeader } from "../headers";
import { useBoardCard, type BoardCardProps } from "../../hooks";
import clsx from "clsx";
import { BoardCardColumns } from "./BoardCardColumns";

export const BoardCard = (props: BoardCardProps) => {
  const { board, expandable, hoverable = true, componentId, onClick } = props;
  const { size, expanded, steps, actions, calcStepItemsHeight } =
    useBoardCard(props);

  return (
    <div
      id={componentId}
      style={{
        width: size,
        height: size,
      }}
      onClick={expandable ? undefined : onClick}
      className={clsx(
        "board-card-container full flex flex-col overflow-hidden card-base relative",
        expandable
          ? "pb-[15px]"
          : "cursor-pointer transition-[translate] duration-75 box-shadow-sm",
        hoverable && !expandable ? "hover:-translate-y-[10px]" : ""
      )}
    >
      <div className="w-full flex flex-row items-center">
        <EditablePageHeader
          value={expandable?.boardName ?? board.boardName}
          setValue={(v) => expandable?.onBoardNameChange(v)}
          actions={actions}
          editable={expanded}
        />
      </div>
      <div
        className={clsx(
          "full",
          "transition-[padding] duration-75",
          expanded ? "px-[60px]" : "p-[15px] pt-[unset]"
        )}
      >
        <div
          className={clsx(
            "full transition-[padding] duration-75 overflow-x-scroll ",
            expanded ? "p-[30px]" : ""
          )}
        >
          <BoardCardColumns
            expanded={expanded}
            steps={steps}
            stepHeights={steps.map(calcStepItemsHeight)}
            editableStep={
              expandable
                ? {
                    stepName: expandable.stepName,
                    stepNameId: expandable.stepNameId,
                    onStepNameChange: expandable.onBoardStepNameChange,
                  }
                : undefined
            }
            onDeleteStep={expandable?.onDeleteStep}
            onReloadBoards={props.expandable?.reloadBoards}
          />
        </div>
      </div>
    </div>
  );
};

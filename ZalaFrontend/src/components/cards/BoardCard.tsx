import { EditablePageHeader, EditablePageHeaderVariant } from "../headers";
import { useBoardCard, type BoardCardProps } from "../../hooks";
import clsx from "clsx";
import { BoardCardColumns } from "./BoardCardColumns";

export const BoardCard = (props: BoardCardProps) => {
  const { board, expandable, hoverable = true, componentId, headerRef, columnsRef, onClick } = props;
  const { size, expanded, steps, actions, calcStepItemsHeight } =
    useBoardCard(props);

  const editableHeaders =
    expandable?.editable !== undefined ? expandable.editable : expanded;

  return (
    <div
      id={componentId}
      style={{
        width: size,
        height: size,
      }}
      onClick={expandable ? undefined : onClick}
      className={clsx(
        "board-card-container full flex flex-col relative card-base",
        expandable ? "!bg-background overflow-hidden" : "overflow-hidden",
        expandable
          ? "pb-[15px]"
          : "cursor-pointer transition-[translate] duration-75 box-shadow-sm",
        hoverable && !expandable ? "hover:-translate-y-[10px]" : "",
      )}
    >
      <div
        ref={headerRef}
        className={clsx(
          "w-full flex flex-row items-center shrink-0",
          expanded ? "px-[60px] pt-[60px] pb-[15px] max-w-[900px] mx-auto" : "",
        )}
      >
        <EditablePageHeader
          variant={
            expanded
              ? EditablePageHeaderVariant.Card
              : EditablePageHeaderVariant.Underline
          }
          value={expandable?.boardName ?? board.boardName}
          setValue={(v) => expandable?.onBoardNameChange(v)}
          actions={actions}
          editable={editableHeaders}
        />
      </div>
      <div
        ref={columnsRef}
        className={clsx(
          "transition-[padding] duration-75",
          expanded ? "flex-1 overflow-x-auto px-[60px]" : "full p-[15px] pt-[unset]",
        )}
      >
        <div
          className={clsx(
            "transition-[padding] duration-75",
            expanded ? "h-full min-w-max p-[30px]" : "full",
          )}
        >
          <BoardCardColumns
            expanded={expanded}
            steps={steps}
            stepHeights={steps.map(calcStepItemsHeight)}
            editableStep={
              editableHeaders && expandable
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

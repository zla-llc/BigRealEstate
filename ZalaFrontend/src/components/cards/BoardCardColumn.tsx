import clsx from "clsx";
import {
  EditablePageHeader,
  EditablePageHeaderSize,
  type Actions,
} from "../headers";
import { BoardItemCard, type DraggableBoardItemData } from "./BoardItemCard";
import type { IBoardStepCard, ILead, IPropertyCard } from "../../interfaces";
import { Button, ButtonVariant } from "../buttons";
import { Icons } from "../icons";
import {
  BoardModalPage,
  useAddBoardStepLeadStore,
  useBoardModalControlStore,
  useBoardSettingsStore,
  useBoardStore,
} from "../../stores";
import { CONFIG } from "../../config";
import { useCallback, useState } from "react";
import { getBoardItemId, getItemIdsFromStep, stringify } from "../../utils";
import { useApi, useStepItems } from "../../hooks";

export type BoardEditStepProps = {
  stepName: string;
  stepNameId: number;
  onStepNameChange: (value: string, stepId: number) => void;
};

type BoardCardColumnProps = {
  step: IBoardStepCard;
  titleProps: {
    value: string;
    onChange: (val: string) => void;
    onClick?: () => void;
    center?: boolean;
    editable?: boolean;
  };
  key: string;

  actions?: Actions[];
  height?: number | string;
  expanded?: boolean;

  onReloadBoards?: () => void;
};

export const BoardCardColumn = ({
  step,
  titleProps,
  expanded,
  height,
  actions,
  onReloadBoards = () => {},
}: BoardCardColumnProps) => {
  const {
    value: title,
    onChange: onTitleChange,
    center = true,
    editable = true,
    onClick: onTitleClick,
  } = titleProps;
  const boardType = useBoardSettingsStore((state) => state.boardType);
  const { board, setStep: setSelectedStep } = useBoardStore();
  const { toggleOpen: toggleBoardModalOpen, setPage: setBoardModalPage } =
    useBoardModalControlStore();
  const { setSelectedBoardItemIds, setEditBoardItemId } =
    useAddBoardStepLeadStore();

  const { updateBoardStepLeads, updateBoardStepProperties } = useApi();

  const {
    boardItems: allItems,
    boardItemIds,
    itemType,
  } = useStepItems({ step });

  const [isDragTarget, setIsDragTarget] = useState(false);

  const items = expanded
    ? allItems
    : allItems.slice(0, CONFIG.maxBoardItemCards);

  const onBoardItemClick = useCallback(
    (i: number) => {
      const boardItem = items[i];
      const itemId = getBoardItemId(boardItem, itemType);
      setSelectedStep(step);
      setSelectedBoardItemIds(boardItemIds);
      setEditBoardItemId(itemId);
      setBoardModalPage(
        boardType === "properties"
          ? BoardModalPage.ManualPropertyPage
          : BoardModalPage.ManualLeadPage
      );
      toggleBoardModalOpen();
    },
    [itemType, boardType, setEditBoardItemId, stringify(items)]
  );

  const onBoardItemDrop = (e: React.DragEvent) => {
    setIsDragTarget(false);

    const cardDataString = e.dataTransfer.getData("card");
    if (!cardDataString || cardDataString.length === 0) return;

    const cardData = JSON.parse(cardDataString) as DraggableBoardItemData;

    if (cardData.fromStepId === step.boardStepId) return;

    (async () =>
      await moveBoardItem(
        cardData.cardId,
        cardData.fromStepId,
        step.boardStepId
      ))();
  };

  const moveBoardItem = async (
    boardItemId: number,
    fromStepId: number,
    toStepId: number
  ) => {
    if (!board) return;

    const fromStep = board.boardSteps.find(
      (step) => step.boardStepId === fromStepId
    );
    const toStep = board.boardSteps.find(
      (step) => step.boardStepId === toStepId
    );

    if (!fromStep || !toStep) return;

    const newFromStepItemIds = getItemIdsFromStep(fromStep)[0].filter(
      (fromId) => fromId !== boardItemId
    );
    const newToStepItemIds = getItemIdsFromStep(toStep)[0];

    newToStepItemIds.push(boardItemId);

    const boardItemApiSetter = async (stepId: number, boardItemIds: number[]) =>
      await (boardType === "lead"
        ? updateBoardStepLeads({ stepId, leadIds: boardItemIds })
        : updateBoardStepProperties({ stepId, propertyIds: boardItemIds }));

    await boardItemApiSetter(fromStepId, newFromStepItemIds);
    await boardItemApiSetter(toStepId, newToStepItemIds);
    onReloadBoards();
  };

  const onAddLeadProperty = () => {
    setSelectedStep(step);
    setSelectedBoardItemIds(boardItemIds);
    setBoardModalPage(
      boardType === "lead"
        ? BoardModalPage.MethodSelectPage
        : BoardModalPage.ManualPropertyPage
    );
    toggleBoardModalOpen();
  };

  return (
    <div
      style={{
        minWidth: expanded ? "25vw" : "unset",
        flex: 1,
        height: expanded ? "100%" : height,
      }}
      className={clsx(
        "flex flex-col",
        "transition-[min-width,min-height] ease-in-out duration-75",
        expanded ? "p-2" : ""
      )}
      onDrop={onBoardItemDrop}
      onDragOver={(e) => (e.preventDefault(), setIsDragTarget(true))}
      onDragLeave={() => setIsDragTarget(false)}
    >
      {expanded && (
        <div
          onClick={onTitleClick}
          className="w-full flex items-center justify-center bg-primary p-[10px] py-[15px] box-shadow-sm rounded-[10px]"
        >
          <EditablePageHeader
            value={title}
            setValue={onTitleChange}
            size={EditablePageHeaderSize.Small}
            actions={actions}
            centerText={center}
            editable={editable}
            disablePadding
          />
        </div>
      )}

      <div className={clsx(expanded ? "px-2.5 h-full " : "")}>
        <div
          className={clsx(
            "full flex flex-col h-full rounded-[10px]",
            isDragTarget ? "bg-accent/50" : "bg-secondary/25",
            expanded
              ? "gap-3.5 p-4 pb-[15px] box-shadow-sm rounded-t-[0px]"
              : "gap-2 p-2.5"
          )}
        >
          <div
            className={clsx(
              "grow w-full overflow-y-scroll space-y-[15px]",
              expanded ? "pt-[15px]" : ""
            )}
          >
            {items.map((item, j) => (
              <BoardItemCard
                key={j}
                stepId={step.boardStepId}
                type={itemType}
                leadInfo={itemType === "lead" ? (item as ILead) : undefined}
                propertyInfo={
                  itemType === "property" ? (item as IPropertyCard) : undefined
                }
                expanded={expanded}
                onClick={() => onBoardItemClick(j)}
              />
            ))}
          </div>

          {expanded && (
            <div>
              <Button
                text={`Add ${boardType === "lead" ? "Lead" : "Property"}`}
                icon={Icons.Add}
                variant={ButtonVariant.Secondary}
                activeVariant={ButtonVariant.Primary}
                onClick={onAddLeadProperty}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

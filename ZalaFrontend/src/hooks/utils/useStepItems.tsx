import { useEffect, useState } from "react";
import { getItemIdsFromStep } from "../../utils";
import type { IBoardStepCard, ILead, IPropertyCard } from "../../interfaces";

export const useStepItems = ({ step }: { step?: IBoardStepCard } = {}) => {
  const [boardItems, setBoardItems] = useState<(IPropertyCard | ILead)[]>([]);
  const [boardItemIds, setBoardItemIds] = useState<number[]>([]);
  const [itemType, setItemType] = useState<"lead" | "property">("lead");

  useEffect(() => {
    if (!step) return;
    const arr = getItemIdsFromStep(step);
    setBoardItemIds(arr[0]);
    setBoardItems(arr[1]);
    setItemType(arr[2]);
  }, [step?.boardStepId]);

  return {
    boardItems,
    boardItemIds,
    itemType,
  };
};

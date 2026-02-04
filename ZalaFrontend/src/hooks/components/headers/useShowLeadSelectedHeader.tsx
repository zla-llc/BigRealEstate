import { useStepItems } from "../../utils";
import { useAddBoardStepLeadStore, useBoardStore } from "../../../stores";

export const useShowLeadSelectedHeader = () => {
  const { step } = useBoardStore();
  const { boardItemIds } = useStepItems({ step });
  const selectedBoardItemIds = useAddBoardStepLeadStore(
    (state) => state.selectedBoardItemIds
  );
  const showRemoveLeads =
    boardItemIds.length > 0 && selectedBoardItemIds.length === 0;
  return {
    showRemoveLeads,
    showHeader: showRemoveLeads || selectedBoardItemIds.length > 0,
  };
};

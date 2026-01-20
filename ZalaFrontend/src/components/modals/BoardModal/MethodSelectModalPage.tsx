import { useShowLeadSelectedHeader } from "../../../hooks";
import {
  BoardModalPage,
  useAddBoardStepLeadStore,
  useBoardModalControlStore,
  useBoardSettingsStore,
} from "../../../stores";
import { MenuButton, ModalButtons } from "../../buttons";
import { BoardStepModalHeader, LeadsSelectedHeader } from "../../headers";
import type { BoardModalPageProps } from "./types";

export const MethodSelectModalPage = ({
  onCloseBtn,
  onConfirm,
}: BoardModalPageProps & { onConfirm: () => void }) => {
  const { boardType } = useBoardSettingsStore();
  const { selectedBoardItemIds, setSelectedBoardItemIds } =
    useAddBoardStepLeadStore();
  const setBoardModalPage = useBoardModalControlStore((state) => state.setPage);
  const { showRemoveLeads, showHeader } = useShowLeadSelectedHeader();

  const isLeadBoard = boardType === "lead";

  const titleText = isLeadBoard ? "a lead(s)" : "properties";
  const selectFromText = isLeadBoard
    ? "Select a lead(s) from past campaigns"
    : "Select from my properties";

  return (
    <div className="full p-6 flex flex-col space-y-[15px]">
      <BoardStepModalHeader onCloseBtn={onCloseBtn} />

      <div className="w-full flex flex-col items-center justify-center">
        <span className="text-lg">
          How would you like to add {titleText} to this step?
        </span>
        {showHeader && (
          <LeadsSelectedHeader
            value={selectedBoardItemIds.length}
            showZero={showRemoveLeads}
          />
        )}
      </div>

      <div className="w-full grow-1  flex flex-col items-center justify-center">
        <div className="w-[50%] flex flex-col items-center justify-center space-y-[15px]">
          {isLeadBoard && (
            <MenuButton
              text={selectFromText}
              onClick={() =>
                setBoardModalPage(
                  isLeadBoard
                    ? BoardModalPage.CampaignSelectPage
                    : BoardModalPage.PropertySelectPage
                )
              }
            />
          )}

          <MenuButton
            text={`Create a new ${isLeadBoard ? boardType : "property"}`}
            onClick={() =>
              setBoardModalPage(
                boardType === "properties"
                  ? BoardModalPage.ManualPropertyPage
                  : BoardModalPage.ManualLeadPage
              )
            }
          />

          {isLeadBoard && (
            <MenuButton
              text={`Import ${titleText}`}
              onClick={() => setBoardModalPage(BoardModalPage.ImportLeadsPage)}
            />
          )}
        </div>
      </div>
      {(selectedBoardItemIds.length > 0 || showRemoveLeads) && (
        <ModalButtons
          primary={{
            text: showRemoveLeads ? `Remove leads` : `Confirm leads`,
            onClick: () => onConfirm(),
            disabled: !showRemoveLeads,
          }}
          secondary={{
            text: "Unselect all",
            onClick: () => setSelectedBoardItemIds([]),
            disabled: selectedBoardItemIds.length === 0,
          }}
        />
      )}
    </div>
  );
};

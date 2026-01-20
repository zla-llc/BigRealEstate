import clsx from "clsx";
import { LeadsSelectedHeader } from "./LeadsSelectedHeader";
import { useAddBoardStepLeadStore, useBoardSettingsStore } from "../../stores";

export const CreateLeadsSelectedHeader = () => {
  const selectedBoardItemIds = useAddBoardStepLeadStore(
    (state) => state.selectedBoardItemIds
  );
  const boardType = useBoardSettingsStore((state) => state.boardType);
  return (
    <div className="w-full flex flex-col items-center justify-center ">
      <span className={clsx("text-lg text-center font-bold")}>
        {boardType === "lead" ? "Create new lead" : "Create new property"}
      </span>
      {selectedBoardItemIds.length > 0 && (
        <LeadsSelectedHeader value={selectedBoardItemIds.length} />
      )}
    </div>
  );
};

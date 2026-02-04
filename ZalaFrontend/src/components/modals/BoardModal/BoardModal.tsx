import { useApi } from "../../../hooks";
import {
  BoardModalPage,
  useAddBoardStepLeadStore,
  useBoardModalControlStore,
  useBoardSettingsStore,
  useBoardStore,
} from "../../../stores";
import { Modal } from "../Modal";
import { CampaignSelectModalPage } from "./CampaignSelectModalPage";
import { ImportLeadsModalPage } from "./ImportLeadsModalPage";
import { ManualCreateLeadModalPage } from "./ManualCreateLeadModalPage";
import { ManualCreateProperty } from "./ManualCreateProperty";
import { MethodSelectModalPage } from "./MethodSelectModalPage";
import { PropertySelectModal } from "./PropertySelectModal";

type BoardModalProps = {
  onAddLeads: () => Promise<void>;
};

export const BoardModal = ({ onAddLeads }: BoardModalProps) => {
  const { step } = useBoardStore();
  const { boardType } = useBoardSettingsStore();
  const { open, toggleOpen, page, setPage } = useBoardModalControlStore();
  const {
    selectedBoardItemIds,
    editBoardItemId,
    resetAllState: resetFormState,
  } = useAddBoardStepLeadStore();

  const { updateBoardStepLeads, updateBoardStepProperties } = useApi();

  const toMethodSelectModal = () => setPage(BoardModalPage.MethodSelectPage);

  const toCampaignSelectModal = () =>
    setPage(BoardModalPage.CampaignSelectPage);

  const toCampaignLeadSelectModal = () =>
    setPage(BoardModalPage.CampaignLeadSelectPage);

  const onClose = () => {
    resetFormState();
    toggleOpen();
  };

  const addSelectedToStep = async (newIds?: number[]) => {
    if (!step) return;

    const useIds = Array.isArray(newIds) ? newIds : selectedBoardItemIds;

    if (boardType === "lead")
      await updateBoardStepLeads({
        stepId: step.boardStepId,
        leadIds: useIds,
      });

    if (boardType === "properties")
      await updateBoardStepProperties({
        stepId: step.boardStepId,
        propertyIds: useIds,
      });
  };

  const onConfirm = async (newIds?: number[]) => {
    await addSelectedToStep(newIds);
    await onAddLeads();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      {page === BoardModalPage.MethodSelectPage && (
        <MethodSelectModalPage onCloseBtn={onClose} onConfirm={onConfirm} />
      )}

      {(page === BoardModalPage.CampaignSelectPage ||
        page === BoardModalPage.CampaignLeadSelectPage ||
        page === BoardModalPage.CampaignLeadDetailsPage) && (
        <CampaignSelectModalPage
          onBackBtn={
            page === BoardModalPage.CampaignSelectPage
              ? toMethodSelectModal
              : page === BoardModalPage.CampaignLeadSelectPage
              ? toCampaignSelectModal
              : toCampaignLeadSelectModal
          }
          onConfirm={onConfirm}
        />
      )}

      {page === BoardModalPage.PropertySelectPage && (
        <PropertySelectModal
          onBackBtn={toMethodSelectModal}
          onConfirm={() => {}}
        />
      )}

      {page === BoardModalPage.ManualLeadPage && (
        <ManualCreateLeadModalPage
          onBackBtn={editBoardItemId !== -1 ? onClose : toMethodSelectModal}
          onConfirm={onConfirm}
        />
      )}

      {page === BoardModalPage.ManualPropertyPage && (
        <ManualCreateProperty onBackBtn={onClose} onConfirm={onConfirm} />
      )}

      {page === BoardModalPage.ImportLeadsPage && (
        <ImportLeadsModalPage onBackBtn={toMethodSelectModal} />
      )}
    </Modal>
  );
};

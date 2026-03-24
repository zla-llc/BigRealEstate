import { GlobalModalPage, useGlobalModalStore } from "../../stores";
import { LeaderBoardGlobalModal } from "./LeaderBoardModals";
import { Modal } from "./Modal";
import {
  TutorialHighlightComponentModal,
  TutorialModal,
} from "./TutorialModals";
import { ViewPropertyModalPage } from "./ViewPropertyModalPage";

export const GlobalModal = () => {
  const globalModalStore = useGlobalModalStore();

  const isHighlightComponentModal =
    globalModalStore.page === GlobalModalPage.HighlightComponentModal;
  const isTutorialModal =
    globalModalStore.page === GlobalModalPage.TutorialModal;

  const onClose = async () => {
    if (globalModalStore.preClose) await globalModalStore.preClose();
    globalModalStore.toggleOpen();
    if (globalModalStore.postClose) await globalModalStore.postClose();
  };

  return (
    <Modal
      open={globalModalStore.isOpen}
      blankModal={isHighlightComponentModal}
      onClose={isTutorialModal ? () => {} : onClose}
    >
      {globalModalStore.page === GlobalModalPage.ViewProperty && (
        <ViewPropertyModalPage onClose={onClose} />
      )}
      {globalModalStore.page === GlobalModalPage.LeaderBoardGlobal && (
        <LeaderBoardGlobalModal onClose={onClose} />
      )}
      {globalModalStore.page === GlobalModalPage.TutorialModal && (
        <TutorialModal onClose={onClose} />
      )}
      {globalModalStore.page === GlobalModalPage.HighlightComponentModal && (
        <TutorialHighlightComponentModal onClose={onClose} />
      )}
    </Modal>
  );
};

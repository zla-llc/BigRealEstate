import { GlobalModalPage, useGlobalModalStore } from "../../stores";
import { Modal } from "./Modal";
import { ViewPropertyModalPage } from "./ViewPropertyModalPage";

export const GlobalModal = () => {
  const globalModalStore = useGlobalModalStore();

  const onClose = async () => {
    if (globalModalStore.preClose) await globalModalStore.preClose();
    globalModalStore.toggleOpen();
    if (globalModalStore.postClose) await globalModalStore.postClose();
  };

  return (
    <Modal open={globalModalStore.isOpen} onClose={onClose}>
      {globalModalStore.page === GlobalModalPage.ViewProperty && (
        <ViewPropertyModalPage onClose={onClose} />
      )}
    </Modal>
  );
};

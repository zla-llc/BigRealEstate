import {
  GlobalModalPage,
  useGlobalModalStore,
  useHighlightComponentStore,
  useTutorialStore,
} from "../../stores";
import { useTutorialPageTo } from "./useTutorialPageTo";
import { TutorialSequence, type TutorialTextKey } from "../../config";

export const useOnTutorialModalChange = () => {
  const globalModalStore = useGlobalModalStore();
  const tutorialStore = useTutorialStore();
  const highlightComponentStore = useHighlightComponentStore();

  const { pageToMaxTutorialStep } = useTutorialPageTo();

  const onClose = async () => {
    if (globalModalStore.preClose) await globalModalStore.preClose();
    globalModalStore.toggleOpen();
    if (globalModalStore.postClose) await globalModalStore.postClose();
  };

  // Assumes modal is allready open
  const changeModal = (newStep: number) => {
    if (newStep > pageToMaxTutorialStep(tutorialStore.page)) return onClose();

    const modalType =
      TutorialSequence[tutorialStore.page.toLowerCase() as TutorialTextKey][
        newStep
      ];

    console.log(``);
    console.log(`Tutorial modal open and changing page`);
    console.log(modalType);
    console.log(``);

    if (modalType === "modal")
      return globalModalStore.setPage(GlobalModalPage.HighlightComponentModal);

    globalModalStore.setPage(GlobalModalPage.HighlightComponentModal);

    if (newStep < highlightComponentStore.highlightComponentDims.length)
      highlightComponentStore.highlightComponentDims[
        newStep
      ]?.ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return changeModal;
};

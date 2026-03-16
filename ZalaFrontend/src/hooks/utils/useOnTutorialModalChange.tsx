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

  // const onClose = async () => {
  //   if (globalModalStore.preClose) await globalModalStore.preClose();
  //   globalModalStore.toggleOpen();
  //   if (globalModalStore.postClose) await globalModalStore.postClose();
  // };

  // Assumes modal is allready open
  const changeModal = (newStep: number) => {
    if (newStep > pageToMaxTutorialStep(tutorialStore.page)) return;

    const modalType =
      TutorialSequence[tutorialStore.page.toLowerCase() as TutorialTextKey][
        newStep
      ];

    if (modalType === "modal")
      return (
        window.scrollTo({ top: 0, behavior: "smooth" }),
        globalModalStore.setPage(GlobalModalPage.TutorialModal)
      );

    globalModalStore.setPage(GlobalModalPage.HighlightComponentModal);

    if (newStep < highlightComponentStore.highlightComponentDims.length) {
      const ref = highlightComponentStore.highlightComponentDims[newStep]?.ref;

      if (!ref?.current) return;

      ref?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return changeModal;
};

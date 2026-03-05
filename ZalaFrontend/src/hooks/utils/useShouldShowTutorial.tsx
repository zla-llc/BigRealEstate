import { useUserTutorial } from "../api";
import {
  GlobalModalPage,
  TextPlacement,
  TutorialPage,
  useAuthStore,
  useGlobalModalStore,
  useHighlightComponentStore,
} from "../../stores";
import { useTutorialPageTo } from "./useTutorialPageTo";
import { TutorialSequence, type TutorialTextKey } from "../../config";
import type { IHighlightComponentDims } from "./types";

import { useTimeoutEffect } from "./useTimeoutEffect";
import { stringify } from "../../utils";
import type { ReactNode } from "react";

export const useShouldShowTutorial = ({
  page,
  highlightComponentDims,
  highlightComponentDimsChange,
  components,
  textPositions,
}: {
  page: TutorialPage;
  highlightComponentDims: (IHighlightComponentDims | null)[];
  highlightComponentDimsChange: number[];
  components: ((() => ReactNode) | null)[];
  textPositions: TextPlacement[];
}) => {
  const { user } = useAuthStore();
  const globalModalStore = useGlobalModalStore();
  const highlightComponentStore = useHighlightComponentStore();

  const [tutorial] = useUserTutorial({ userId: user?.userId });

  const { pageToMaxTutorialStep, pageToTutorialKey } = useTutorialPageTo();

  useTimeoutEffect(
    () => {
      shouldShowTutorialForPage();
    },
    [tutorial?.tutorial_id, stringify(highlightComponentDimsChange)],
    250,
  );

  const shouldShowTutorialForPage = () => {
    const key = pageToTutorialKey(page);
    if (!key || !tutorial) return;

    const tutorialStep = tutorial[key];
    const maxTutorialStep = pageToMaxTutorialStep(page);

    if (tutorialStep === -1 || tutorialStep >= maxTutorialStep) return;

    const modalType =
      TutorialSequence[page.toLowerCase() as TutorialTextKey][tutorialStep];

    console.log(``);
    console.log(`Should Show Tut Set Global State`);
    console.log(highlightComponentDimsChange);
    console.log(``);

    highlightComponentStore.setHighlightComponentDims(highlightComponentDims);
    highlightComponentStore.setComponents(components);
    highlightComponentStore.setTextPlacement(textPositions);
    // highlightComponentStore.setDimsChange()

    if (
      globalModalStore.isOpen &&
      (globalModalStore.page === GlobalModalPage.HighlightComponentModal ||
        globalModalStore.page === GlobalModalPage.TutorialModal)
    )
      return;

    console.log(``);
    console.log(`Should Show Tut Opening`);
    console.log();
    console.log(``);

    globalModalStore.setListener("postClose", () => {
      highlightComponentStore.setHighlightComponentDims([]);
      highlightComponentStore.setComponents([]);

      globalModalStore.setPage(GlobalModalPage.None);
      globalModalStore.clearListeners();
    });
    globalModalStore.setPage(
      modalType === "modal"
        ? GlobalModalPage.TutorialModal
        : GlobalModalPage.HighlightComponentModal,
    );
    globalModalStore.setIsOpen(true);
  };
};

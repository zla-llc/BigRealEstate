import { useUserTutorial } from "../api";
import {
  GlobalModalPage,
  TutorialPage,
  useAuthStore,
  useGlobalModalStore,
  useHighlightComponentStore,
  useTutorialStore,
} from "../../stores";
import { useTutorialPageTo } from "./useTutorialPageTo";
import {
  TutorialSequence,
  TutorialSequenceMaximums,
  TutorialTextPlacements,
  type TutorialTextKey,
} from "../../config";
import type { IHighlightComponentDims } from "./types";
import { useTimeoutEffect } from "./useTimeoutEffect";
import { stringify } from "../../utils";
import type { ReactNode } from "react";
import { useAppLocation } from "./useAppLocation";

type UseShouldShowTutorial = {
  page: TutorialPage;
  highlightComponentDims: (IHighlightComponentDims | null)[];
  highlightComponentDimsChange: number[];
  components: ((() => ReactNode) | null)[];
  forceWait?: boolean;
};

export const useShouldShowTutorial = ({
  page,
  highlightComponentDims,
  highlightComponentDimsChange,
  components,

  forceWait,
}: UseShouldShowTutorial) => {
  const { user } = useAuthStore();
  const tutorialStore = useTutorialStore();
  const globalModalStore = useGlobalModalStore();
  const highlightComponentStore = useHighlightComponentStore();

  useUserTutorial({
    userId: user?.userId,
    setToStore: true,
  });

  const { pageToMaxTutorialStep, pageToTutorialKey } = useTutorialPageTo();

  const { pathname, isDashboardPage, isSearchPage } = useAppLocation();

  useTimeoutEffect(
    () => {
      if (forceWait) return;
      console.log(`Should Show Tut 4 ${page}`);
      console.log(stringify(tutorialStore.tutorial));
      const res = shouldShowTutorialForPage();
      console.log(res, tutorialStore.page);
      console.log(``);
    },
    [
      forceWait,
      pathname,
      tutorialStore.page,
      tutorialStore.tutorial?.tutorial_id,
      stringify(highlightComponentDimsChange),
    ],
    250,
  );

  const isThisPageTurn = () => {
    if (!tutorialStore.tutorial) return false;

    switch (page) {
      case TutorialPage.Navbar:
        if (
          tutorialStore.tutorial.dashboard_step >
            TutorialSequenceMaximums.dashboard &&
          isDashboardPage
        ) {
          return true;
        }

        if (isSearchPage && tutorialStore.tutorial.map_step === 0) return true;

        return false;

      default:
        return true;
    }
  };

  const shouldShowTutorialForPage = (): 0 | 1 | 2 => {
    const key = pageToTutorialKey(page);
    if (!key || !tutorialStore.tutorial) return 0;

    console.log(`isThisPageTurn(${page}): ${isThisPageTurn()}`);
    if (!isThisPageTurn()) return 0;

    const tutorialStep = tutorialStore.tutorial[key];
    const maxTutorialStep = pageToMaxTutorialStep(page);

    if (tutorialStep === -1 || tutorialStep > maxTutorialStep) return 0;

    const modalType =
      TutorialSequence[page.toLowerCase() as TutorialTextKey][tutorialStep];

    highlightComponentStore.setHighlightComponentDims(highlightComponentDims);
    highlightComponentStore.setComponents(components);
    highlightComponentStore.setTextPlacement(
      TutorialTextPlacements[page.toLowerCase() as TutorialTextKey],
    );

    if (
      globalModalStore.isOpen &&
      (globalModalStore.page === GlobalModalPage.HighlightComponentModal ||
        globalModalStore.page === GlobalModalPage.TutorialModal)
    )
      return 1;

    tutorialStore.setPage(page);
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

    return 2;
  };
};

import { TutorialSequenceMaximums } from "../../config";
import type { ITutorial } from "../../interfaces";
import { TutorialPage } from "../../stores";

export const useTutorialPageTo = () => {
  const pageToTutorialKey = (
    page: TutorialPage,
  ): keyof Omit<Omit<ITutorial, "user_id">, "tutorial_id"> | undefined => {
    switch (page) {
      case TutorialPage.Dashboard:
        return "dashboard_step";
      default:
        return undefined;
    }
  };

  // Gives max index value (zero based)
  const pageToMaxTutorialStep = (page: TutorialPage) => {
    switch (page) {
      case TutorialPage.Dashboard:
        return TutorialSequenceMaximums.dashboard;
      default:
        return -1;
    }
  };

  return {
    pageToTutorialKey,
    pageToMaxTutorialStep,
  };
};

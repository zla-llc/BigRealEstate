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
      case TutorialPage.Search:
        return "map_step";
      case TutorialPage.Campaign:
        return "campaign_step";
      case TutorialPage.Navbar:
        return "navbar_step";
      default:
        return undefined;
    }
  };

  // Gives max index value (zero based)
  const pageToMaxTutorialStep = (page: TutorialPage) => {
    switch (page) {
      case TutorialPage.Dashboard:
        return TutorialSequenceMaximums.dashboard;
      case TutorialPage.Navbar:
        return TutorialSequenceMaximums.navbar;
      case TutorialPage.Campaign:
      case TutorialPage.Search:
      default:
        // return TutorialSequenceMaximums.dashboard;
        // return TutorialSequenceMaximums.dashboard;
        return -1;
    }
  };

  return {
    pageToTutorialKey,
    pageToMaxTutorialStep,
  };
};

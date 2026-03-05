import { TextPlacement } from "../stores";

// Keys must be values of TutorialPage enum lowercased
export const TutorialText = {
  dashboard: [
    "This is your dashboard! It is the central location for viewing and managing your team, your leads, and your properties.",
    "This is your team name. Admins can change the team name by editing the text box.",
    "These are all the members of your team. Admins have extra permissions such as renaming the team and removing team members or properties.",
    "Invited members are individuals who have been invited to the team, but have not yet joined.",
    "Announcements are a way for admins to display messages for the team.",
    "The team leaderboard ranks team members by the XP they have from deals. Close more deals than your colleagues to top the leaderboard!",
    "Team properties are viewable by all team members, but can only be edited by admins or the creator of the property card. Property cards that you create will be shown under 'My Properties'. You can add one of your properties to the team properties with the + button.",
    "Just like with properties, boards can be personal or shared with a team. All boards you create will be shown under 'My Boards', and can be added to the team boards with the + button.",
  ],
};

export type TutorialTextKey = keyof typeof TutorialText;

export const TutorialSequence = {
  dashboard: [
    "modal",
    "component",
    "component",
    "component",
    "component",
    "component",
    "component",
    "component",
  ],
};

export const TutorialSequenceMaximums = {
  dashboard: 7,
};

export const TutorialTextPlacements = {
  dashboard: [
    TextPlacement.Top,
    TextPlacement.Bottom,
    TextPlacement.Right,
    TextPlacement.Left,
    TextPlacement.Right,
    TextPlacement.Left,
    TextPlacement.Right,
    TextPlacement.Left,
  ],
};

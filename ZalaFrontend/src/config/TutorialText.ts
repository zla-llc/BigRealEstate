import { TextPlacement } from "../stores";

// Keys must be values of TutorialPage enum lowercased
export const TutorialText = {
  dashboard: [
    "This is your dashboard! It is the central location for viewing and managing your team, your leads, and your properties.",
    "This is your team name. Admins can change the team name by editing the text box.",
    "These are all the admins on your team. Admins have extra permissions such as renaming the team and removing team members or properties.",
    "Invited members are individuals who have been invited to the team, but have not yet joined.",
    "These are all the members on your team.",
    "Announcements are a way for admins to display messages for the team.",
    "The team leaderboard ranks team members by the XP they have from deals. Close more deals than your colleagues to top the leaderboard!",
    "This is where your personal properties can be viewed. These will not be visible to your team members unless you add them to your team's properties.",
    "Team properties are viewable by all team members, but can only be edited by admins or the creator of the property card.",
    "Just like with properties, boards can be personal or shared with a team. All boards you create will be shown under 'My Boards', and can be added to the team boards with the + button.",
    "Want to explore more of ZLA now? Next up: Finding New Leads!",
  ], // 11
  navbar: ["Type a location in the search bar to find leads from that area!"],
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
    "component",
    "component",
    "modal",
  ],
  navbar: ["component"],
};

export const TutorialSequenceMaximums = {
  dashboard: TutorialText.dashboard.length - 1,
  navbar: TutorialText.navbar.length - 1,
};

export const TutorialTextPlacements = {
  dashboard: [
    TextPlacement.Modal,
    TextPlacement.Bottom,
    TextPlacement.Right,
    TextPlacement.Left,
    TextPlacement.Top,
    TextPlacement.Right,
    TextPlacement.Left,
    TextPlacement.Left, // Properties
    TextPlacement.Right,
    TextPlacement.Top,
    TextPlacement.Modal,
  ],
  navbar: [TextPlacement.Bottom],
};

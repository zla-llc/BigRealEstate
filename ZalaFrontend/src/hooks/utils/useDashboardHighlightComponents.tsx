import type { IHighlightComponentDims } from "./types";
import { useDimensions } from "./useDimensions";

export const useDashboardHighlightComponents = () => {
  const [teamNameRef, teamNameDims, _setTeamNameDims, teamNameCount] =
    useDimensions();

  const [adminCardRef, adminCardDims, _setAdminCardDims, adminCardCount] =
    useDimensions();
  const [
    invitationCardRef,
    invitationCardDims,
    _setInvitationCardDims,
    invitationCardCount,
  ] = useDimensions();
  const [membersRef, membersDims, _setMembersDims, membersCount] =
    useDimensions();

  const [
    announcmentRef,
    announcmentDims,
    _setAnnouncmentDims,
    announcmentCount,
  ] = useDimensions();
  const [
    leaderboardsRef,
    leaderboardsDims,
    _setLeaderboardsDims,
    leaderboardsCount,
  ] = useDimensions();

  const [
    teamPropertiesRef,
    teamPropertiesDims,
    _setTeamPropertiesDims,
    teamPropertiesCount,
  ] = useDimensions();
  const [propertiesRef, propertiesDims, __setPropertiesDims, propertiesCount] =
    useDimensions();

  const [teamBoardsRef, teamBoardsDims, __setTeamBoardsDims, teamBoardsCount] =
    useDimensions();

  const highlightComponentDims: (IHighlightComponentDims | null)[] = [
    null,
    { ref: teamNameRef, dims: teamNameDims },
    { ref: adminCardRef, dims: adminCardDims },
    { ref: invitationCardRef, dims: invitationCardDims },
    { ref: membersRef, dims: membersDims },
    { ref: announcmentRef, dims: announcmentDims },
    { ref: leaderboardsRef, dims: leaderboardsDims },
    { ref: propertiesRef, dims: propertiesDims },
    { ref: teamPropertiesRef, dims: teamPropertiesDims },
    { ref: teamBoardsRef, dims: teamBoardsDims },
  ];
  const highlightComponentDimsChange = [
    teamNameCount,
    adminCardCount,
    invitationCardCount,
    membersCount,
    announcmentCount,
    leaderboardsCount,
    propertiesCount,
    teamPropertiesCount,
    teamBoardsCount,
  ];

  return {
    refs: {
      teamNameRef,
      adminCardRef,
      invitationCardRef,
      membersRef,
      announcmentRef,
      leaderboardsRef,
      propertiesRef,
      teamPropertiesRef,
      teamBoardsRef,
    },

    highlightComponentDims,
    highlightComponentDimsChange,
  };
};

import { useEffect } from "react";
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
  const [
    announcmentRef,
    announcmentDims,
    _setAnnouncmentDims,
    announcmentCount,
  ] = useDimensions();

  const highlightComponentDims: (IHighlightComponentDims | null)[] = [
    null,
    { ref: teamNameRef, dims: teamNameDims },
    { ref: adminCardRef, dims: adminCardDims },
    { ref: invitationCardRef, dims: invitationCardDims },
    { ref: announcmentRef, dims: announcmentDims },
  ];
  const highlightComponentDimsChange = [
    teamNameCount,
    adminCardCount,
    invitationCardCount,
    announcmentCount,
  ];

  useEffect(() => {
    console.log(``);
    console.log(`Detected Announcment Change ${announcmentCount}x:`);
    console.log(announcmentDims);
    console.log(``);
  }, [announcmentCount]);

  return {
    refs: { teamNameRef, adminCardRef, invitationCardRef, announcmentRef },

    highlightComponentDims,
    highlightComponentDimsChange,
  };
};

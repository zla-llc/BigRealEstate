import { useEffect } from "react";
import type { IHighlightComponentDims } from "./types";
import { useDimensions } from "./useDimensions";
import { stringify } from "../../utils";

export const useLeadSearchHighlightComponents = () => {
  const [leadCardRef, leadCardDims, __setLeadCardDims, leadCardCount] =
    useDimensions();
  const [
    campaignTitleRef,
    campaignTitleDims,
    __setCampaignTitleDims,
    campaignTitleCount,
  ] = useDimensions();

  const highlightComponentDims: (IHighlightComponentDims | null)[] = [
    null,
    { ref: leadCardRef, dims: leadCardDims },
    { ref: campaignTitleRef, dims: campaignTitleDims },
  ];

  const highlightComponentDimsChange = [0, leadCardCount, campaignTitleCount];

  useEffect(() => {
    console.log(`Lead card dims`);
    console.log(stringify(leadCardDims), leadCardRef.current);
    console.log(``);
  }, [leadCardCount]);

  return {
    refs: {
      leadCardRef,
      campaignTitleRef,
    },
    highlightComponentDims,
    highlightComponentDimsChange,
  };
};

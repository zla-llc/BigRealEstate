import { produce } from "immer";
import { useState } from "react";
import type { ICampaign } from "../../../interfaces";
import {
  useBoardModalControlStore,
  useBoardStore,
  useAddBoardStepLeadStore,
  BoardModalPage,
} from "../../../stores";
import { useGetCampaignLeads } from "../../api";
import { usePastCampaignsPage } from "../../pages";
import type { BoardModalPageProps } from "../../../components";
import { useStepItems } from "../../utils";
import { useShowLeadSelectedHeader } from "../headers";

export const useCampaignSelectModalPage = (props: BoardModalPageProps) => {
  const { campaigns, loading: campaignsLoading } = usePastCampaignsPage();
  const { page, setPage } = useBoardModalControlStore();
  const { step } = useBoardStore();
  const { selectedBoardItemIds, setSelectedBoardItemIds } =
    useAddBoardStepLeadStore();

  const { boardItems } = useStepItems({ step });
  const { showRemoveLeads, showHeader } = useShowLeadSelectedHeader();

  const [selectedCampaign, setSelectedCampaign] = useState<
    ICampaign | undefined
  >(undefined);
  const [leads, leadsLoading] = useGetCampaignLeads(selectedCampaign);
  const [viewLeadOnClick, setViewLeadOnClick] = useState(false);
  const [viewingLeadKey, setViewingLeadKey] = useState<[number, number]>([
    -1, -1,
  ]);
  const loading = campaignsLoading || leadsLoading;
  const isCampaignSelectPage = page === BoardModalPage.CampaignSelectPage;
  const isCampaignLeadSelectPage =
    page === BoardModalPage.CampaignLeadSelectPage;
  const isCampaignLeadDetailsPage =
    page === BoardModalPage.CampaignLeadDetailsPage;

  const viewingLead =
    viewingLeadKey[1] >= 0 && viewingLeadKey[1] < leads.length
      ? leads[viewingLeadKey[1]]
      : undefined;
  const onCampaignClick = (campaign: ICampaign) => () => {
    setSelectedCampaign(campaign);
    setPage(BoardModalPage.CampaignLeadSelectPage);
  };
  const toggleSelectedLead = (leadId: number) =>
    setSelectedBoardItemIds(
      produce(selectedBoardItemIds, (draft) => {
        if (draft.includes(leadId))
          return draft.filter((draftId) => draftId !== leadId);
        else draft.push(leadId);
      })
    );
  const onLeadClick = (leadId: number, i: number) => () => {
    if (viewLeadOnClick)
      return (
        setViewingLeadKey([leadId, i]),
        setPage(BoardModalPage.CampaignLeadDetailsPage)
      );

    toggleSelectedLead(leadId);
  };
  const onDetailedPrimaryClick = () => {
    if (!viewingLead) return;
    toggleSelectedLead(viewingLead.leadId);
  };
  const onBackBtn = () =>
    isCampaignLeadDetailsPage
      ? (setViewingLeadKey([-1, -1]), props?.onBackBtn && props.onBackBtn())
      : props?.onBackBtn && props.onBackBtn();

  return {
    loading,
    campaigns,
    leads,
    viewingLead,
    viewingLeadKey,
    step,
    boardItems,

    isCampaignLeadDetailsPage,
    isCampaignLeadSelectPage,
    isCampaignSelectPage,

    showHeader,
    showRemoveLeads,

    selectedBoardItemIds,
    setSelectedBoardItemIds,

    viewLeadOnClick,
    setViewLeadOnClick,

    onBackBtn,
    onLeadClick,
    onCampaignClick,
    onDetailedPrimaryClick,
  };
};

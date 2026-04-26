import { CampaignCard, CardVariant, LeadCard } from "../../cards";
import {
  BoardStepModalHeader,
  EditablePageHeaderSize,
  LeadsSelectedHeader,
  PageHeader,
} from "../../headers";
import type { BoardModalPageProps } from "./types";
import { Loader } from "../../feedback";
import clsx from "clsx";
import { SwitchInput } from "../../inputs";
import { ModalButtons } from "../../buttons";
import { AGENT_IMAGES_ARR } from "../../../assets";
import { ModalCenterButtons } from "../../buttons/ModalCenterButtons";
import { LeadInfoSection, LeadNotesSection } from "../../sections";
import { Icons } from "../../icons";
import { useCampaignSelectModalPage } from "../../../hooks";

export const CampaignSelectModalPage = (
  props: BoardModalPageProps & { onConfirm: () => void },
) => {
  const {
    loading,
    campaigns,
    leads,
    viewingLead,
    viewingLeadKey,
    step,

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
  } = useCampaignSelectModalPage(props);

  return (
    <div className="full p-6 flex flex-col space-y-[30px]">
      <BoardStepModalHeader onBackBtn={onBackBtn} />

      <div className="grow-1 flex flex-col">
        {!isCampaignLeadDetailsPage && (
          <div className="w-full flex flex-col items-center justify-center pb-[5px]">
            <span
              className={clsx(
                "text-lg text-center",
                isCampaignSelectPage ? "w-[40%]" : "",
              )}
            >
              {isCampaignSelectPage
                ? "Which campaign would you like to choose leads from?"
                : "Select the leads to add to step: "}
              {step && <span className="font-bold">'{step.stepName}'</span>}
            </span>
            {showHeader && (
              <LeadsSelectedHeader
                value={selectedBoardItemIds.length}
                showZero={showRemoveLeads}
              />
            )}
          </div>
        )}

        {loading ? (
          <div className="grow-1 flex justify-center items-center">
            <Loader darkMode />
          </div>
        ) : (
          <div className="grow-1 flex relative pointer-events-auto">
            {!isCampaignLeadDetailsPage && (
              <div className="absolute-fill py-[15px] flex flex-col px-[15px] space-y-[30px] overflow-y-scroll">
                {isCampaignLeadSelectPage && (
                  <div className="flex flex-row items-center justify-center space-x-[15px]">
                    <div>
                      <SwitchInput
                        text="Click to view"
                        shadow={false}
                        reverse
                        checked={viewLeadOnClick}
                        onClick={() => setViewLeadOnClick((prev) => !prev)}
                      />
                    </div>
                    <div>
                      <SwitchInput
                        text="Click to select"
                        shadow={false}
                        checked={!viewLeadOnClick}
                        onClick={() => setViewLeadOnClick((prev) => !prev)}
                      />
                    </div>
                  </div>
                )}

                <div className="grow-1 grid grid-cols-3 gap-[30px]">
                  {isCampaignSelectPage
                    ? campaigns.map((campaign) => (
                        <div
                          key={campaign.campaignId}
                          className="flex justify-center h-min"
                        >
                          <CampaignCard
                            campaign={campaign}
                            onClick={onCampaignClick(campaign)}
                            variant={CardVariant.Secondary}
                          />
                        </div>
                      ))
                    : leads.map((lead, i) => (
                        <LeadCard
                          key={lead.leadId}
                          i={i}
                          lead={lead}
                          variant={CardVariant.Secondary}
                          active={selectedBoardItemIds.includes(lead.leadId)}
                          onClick={onLeadClick(lead.leadId, i)}
                        />
                      ))}
                </div>
              </div>
            )}

            {isCampaignLeadDetailsPage && viewingLead && (
              <div className="grow-1 flex flex-row space-x-[15px]">
                <div className="h-full flex items-center justify-center">
                  <div className="w-[250px] h-[250px] rounded-[15px] overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src={
                        AGENT_IMAGES_ARR[
                          Math.max(viewingLeadKey[1], 0) %
                            AGENT_IMAGES_ARR.length
                        ]
                      }
                      alt={`Lead-${viewingLeadKey[1] + 1}-img`}
                    />
                  </div>
                </div>

                <div className="grow-1 flex flex-col h-full space-y-[30px]">
                  <div className="w-full">
                    <div className="w-full flex items-center justify-center">
                      {showHeader && (
                        <LeadsSelectedHeader
                          value={selectedBoardItemIds.length}
                        />
                      )}
                    </div>
                    {viewingLead.contact && (
                      <p className="w-full text-center text-xl font-bold">
                        Contact: {viewingLead.contact.firstName}{" "}
                        {viewingLead.contact.lastName}
                      </p>
                    )}
                  </div>

                  <div className="w-full grow-1 relative overflow-y-scroll">
                    <div className="absolute-fill flex items-start justify-center overflow-y-scroll">
                      <div className="w-[80%] space-y-[15px] pb-[50px]">
                        <PageHeader
                          value="Contact Info"
                          disablePadding
                          size={EditablePageHeaderSize.Small}
                        />

                        <LeadInfoSection lead={viewingLead} />

                        <PageHeader
                          value="Notes"
                          disablePadding
                          size={EditablePageHeaderSize.Small}
                        />

                        <LeadNotesSection
                          lead={viewingLead}
                          notes={viewingLead.notes}
                          editable={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading &&
          (isCampaignLeadDetailsPage ? (
            <ModalCenterButtons
              primary={{
                text: selectedBoardItemIds.includes(viewingLeadKey[0])
                  ? "Unselect lead"
                  : "Select lead",
                onClick: onDetailedPrimaryClick,
                icon: selectedBoardItemIds.includes(viewingLeadKey[0])
                  ? Icons.Minus
                  : Icons.Add,
              }}
            />
          ) : (
            <ModalButtons
              primary={{
                text: showRemoveLeads ? `Remove leads` : `Confirm leads`,
                onClick: () => props.onConfirm(),
                disabled: !showHeader,
              }}
              secondary={{
                text: "Unselect all",
                onClick: () => setSelectedBoardItemIds([]),
                disabled: selectedBoardItemIds.length === 0,
              }}
            />
          ))}
      </div>
    </div>
  );
};

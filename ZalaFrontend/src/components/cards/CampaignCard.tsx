import clsx from "clsx";
import type { ICampaign } from "../../interfaces";
import { useHover } from "../../hooks";
import { CardVariant } from "./types";

type CampaignCardProps = {
  campaign: ICampaign;
  variant?: CardVariant;
  onClick?: () => void;
};

const SIZE = 300;

export const CampaignCard = ({
  campaign,
  variant = CardVariant.Primary,
  onClick,
}: CampaignCardProps) => {
  const isSecondVariant = variant === CardVariant.Secondary;
  const [_isHovered, hoverProps] = useHover({ onClick });
  const contactedLeads = campaign.leads.filter(
    (lead) => lead.contactMethods.length > 0
  );

  // if (variant === CardVariant.Secondary) return (

  // )

  return (
    <div
      {...hoverProps}
      style={{
        width: SIZE,
      }}
      className={clsx(
        "card-base box-shadow flex flex-col p-[15px] space-y-[15px]",
        isSecondVariant ? "bg-white!" : "",
        "transition-[translate] duration-75 hover:translate-y-[-5px]",
        onClick ? "cursor-pointer" : ""
      )}
    >
      <div>
        <p className="text-xl font-bold">{campaign.campaignName}</p>
        <p className="text-base text-secondary-50">
          {contactedLeads.length} of {campaign.leads.length} Leads Contacted
        </p>
      </div>
      <div
        className={clsx(
          "w-full h-[15px] rounded-[15px] bg-secondary-50/50 flex flex-row overflow-hidden"
        )}
      >
        {campaign.leads
          .sort((a, b) => b.contactMethods.length - a.contactMethods.length)
          .map((lead) => (
            <div
              key={lead.leadId}
              style={{ flex: 1 / campaign.leads.length }}
              className={clsx(
                lead.contactMethods.length > 0 ? "bg-accent h-full" : ""
              )}
            />
          ))}
      </div>
    </div>
  );
};

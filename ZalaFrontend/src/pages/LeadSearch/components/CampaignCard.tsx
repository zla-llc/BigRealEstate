import { forwardRef } from "react";
import { Button, Icons } from "../../../components";

type CampaignCardProps = {
  campaignLeads: number;
  title: string;
  setTitle: (v: string) => void;
  onStart: () => void;
};

export const CampaignCard = forwardRef<HTMLDivElement, CampaignCardProps>(
  ({ campaignLeads, title, setTitle, onStart }, ref) => {
    const onChange = ({
      target: { value },
    }: React.ChangeEvent<HTMLTextAreaElement>) => setTitle(value);
    return (
      <div ref={ref} className="bg-white rounded-[15px] p-3.75 w-full">
        <span className="block w-full text-center font-bold text-base ">
          Campaign
        </span>
        <textarea
          className="text-area-style max-h-12"
          placeholder="Campaign title"
          value={title}
          onChange={onChange}
        />
        <div className="flex flex-row items-center justify-between mb-3.75">
          <span className="text-secondary-50">Leads:</span>
          <span className="text-secondary-50">{campaignLeads}</span>
        </div>
        <Button
          text="Start"
          icon={Icons.Flag}
          disabled={campaignLeads === 0}
          onClick={onStart}
        />
      </div>
    );
  },
);

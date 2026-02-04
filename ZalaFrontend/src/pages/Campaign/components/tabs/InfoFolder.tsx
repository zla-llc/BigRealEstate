import { Icons, LeadInfoSection } from "../../../../components";
import { CampaignTab } from "../../../../interfaces";
import { useFolderIcons } from "../../hooks";
import { Folder, LeadButtons, LeadFolder } from "../layout";
import type { CampaignFolderChildProps } from "./types";

type InfoFolderProps = CampaignFolderChildProps;

export const InfoFolder = ({
  title,
  showBackBtn,
  lead,
  viewing,
  disableSecondary,
  onPrimary,
  onSecondary,
}: InfoFolderProps) => {
  const icons = useFolderIcons({ active: CampaignTab.Profile, showBackBtn });

  return (
    <Folder
      title={title}
      icons={icons}
      footer={
        <LeadButtons
          secondary={{
            text: "Skip",
            icon: Icons.Skip,
            onPress: onSecondary,
            disabled: disableSecondary,
          }}
          primary={{ text: "Email", icon: Icons.Mail, onPress: onPrimary }}
        />
      }
    >
      <LeadFolder i={viewing}>
        {lead && (
          <div className="w-full h-full pr-[30px] py-[30px]">
            <div className="relative w-full h-full">
              <div className="absolute-fill flex flex-col items-center overflow-scroll">
                <p className="w-full text-center text-xl font-bold">
                  Contact: {lead.contact.firstName} {lead.contact.lastName}
                </p>
                <div className="w-full flex grow-1 items-center justify-center">
                  <LeadInfoSection lead={lead} />
                </div>
              </div>
            </div>
          </div>
        )}
      </LeadFolder>
    </Folder>
  );
};

import { ModalHeader } from "../../headers";
import { Icons } from "../../icons";
import { useDashboardModalStore } from "../../../stores";
import { useDashboardPage, useFireIfExists } from "../../../hooks";
import { AnnouncementCard } from "../../cards";

type ViewAnnouncementsModalProps = {
  title?: string;
  onClose?: () => void;
};

export const ViewAnnouncementsModal = ({
  title = "All Announcements",
  onClose,
}: ViewAnnouncementsModalProps) => {
  const { announcements, onEditAnnouncementClick, onDeleteAnnouncement } =
    useDashboardPage();
  const toggleModalOpen = useDashboardModalStore((state) => state.toggle);
  const fireIfExists = useFireIfExists();
  return (
    <div className="full p-6 flex flex-col space-y-[30px]">
      <ModalHeader
        title={title}
        actions={[
          {
            type: "iconBtn",
            side: "left",
            iconBtnProps: {
              name: Icons.Close,
              onClick: onClose ? onClose : () => toggleModalOpen(false),
            },
          },
        ]}
      />

      <div className="overflow-y-scroll px-[30px]">
        <div className="grow-1 flex flex-col justify-center gap-y-[30px]">
          {announcements.map((anncmnt) => (
            <AnnouncementCard
              key={anncmnt.announcement_id}
              message={anncmnt}
              onTrash={fireIfExists(
                anncmnt.announcement_id,
                onDeleteAnnouncement,
              )}
              onEdit={fireIfExists(
                anncmnt.announcement_id,
                onEditAnnouncementClick,
              )}
            />
          ))}
        </div>

        <div className="opacity-0">
          <AnnouncementCard
            message={{
              announcement_id: -1,
              author_id: -1,
              created_at: "",
              message: "",
              team_id: -1,
              title: "",
            }}
          />
        </div>
      </div>
    </div>
  );
};

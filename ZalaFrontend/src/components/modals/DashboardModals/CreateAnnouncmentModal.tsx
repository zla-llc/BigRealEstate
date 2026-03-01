import { ModalHeader } from "../../headers";
import { Icons } from "../../icons";
import { ModalCenterButtons } from "../../buttons";
import { RichTextEditor, TextInput } from "../../inputs";
import { useDashboardPage } from "../../../hooks";
import { useDashboardModalStore } from "../../../stores";
type CreateAnnouncmentModalProps = {
  onClose?: () => void;
};

export const CreateAnnouncmentModal = ({
  onClose,
}: CreateAnnouncmentModalProps) => {
  const {
    announcementMessage,
    announcementTitle,
    isEditingAnnouncements,
    setAnnouncementMessage,
    setAnnouncementTitle,

    onPostAnnouncement,
  } = useDashboardPage();
  const { toggle } = useDashboardModalStore();

  const onPost = async () => {
    const success = await onPostAnnouncement();
    if (!success) return;
    toggle(false);
  };

  return (
    <div className="full p-6 flex flex-col space-y-[30px]">
      <ModalHeader
        title={
          isEditingAnnouncements
            ? "Update Announcement"
            : "Create New Announcement"
        }
        actions={[
          onClose
            ? {
                type: "iconBtn",
                side: "left",
                iconBtnProps: {
                  name: Icons.Close,
                  onClick: onClose,
                },
              }
            : null,
        ]}
      />

      <div className="grow-1 flex flex-col items-center justify-center ">
        <div className="w-[75%] space-y-[15px]">
          <TextInput
            label="Announcement Title"
            value={announcementTitle}
            setValue={setAnnouncementTitle}
          />

          <RichTextEditor
            label="Announcement Message"
            value={announcementMessage}
            onChange={setAnnouncementMessage}
            commands={[]}
          />
        </div>
      </div>

      <ModalCenterButtons
        primary={{
          text: isEditingAnnouncements ? "Update Post" : "Post",
          onClick: onPost,
        }}
      />
    </div>
  );
};

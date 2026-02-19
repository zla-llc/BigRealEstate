import {
  DashboardModalPages,
  useCreatePropertyStore,
  useDashboardModalStore,
  useViewPropertiesModalStore,
} from "../../../stores";
import { ManualCreateProperty } from "../Forms";
import { Modal } from "../Modal";
import { ViewBoardsModal } from "../ViewBoardsModal";
import { ViewPropertiesModal } from "../ViewPropertiesModal";
import { CreateAnnouncmentModal } from "./CreateAnnouncmentModal";
import { CreateBoardModal } from "./CreateBoardModal";
import { InviteMemberModal } from "./InviteMemberModal";
import { LeaderboardModal } from "./LeaderboardModal";
import { MemberModal } from "./MemberModal";
import { ViewAnnouncementsModal } from "./ViewAnnouncementsModal";

type DashboardModalsProps = {
  title?: string;
};

export const DashboardModals = (_props: DashboardModalsProps) => {
  const { page, isOpen, toggle } = useDashboardModalStore();
  const { setEditingProperty } = useCreatePropertyStore();
  const { setProperties } = useViewPropertiesModalStore();

  const close = () => (toggle(false), clearEditStates());

  const clearEditStates = () => (
    setEditingProperty(undefined),
    setProperties([])
  );

  return (
    <Modal open={isOpen} onClose={close}>
      {page === DashboardModalPages.InviteMemberModal && <InviteMemberModal />}
      {page === DashboardModalPages.ViewMemberModal && <MemberModal />}
      {page === DashboardModalPages.LeaderboardModal && <LeaderboardModal />}
      {page === DashboardModalPages.CreateProperty && (
        <ManualCreateProperty
          onCloseBtn={close}
          onConfirm={close}
          onTrashDeletes
        />
      )}
      {(page === DashboardModalPages.ViewPropertiesModal ||
        page === DashboardModalPages.AddTeamProperties) && (
        <ViewPropertiesModal onClose={close} />
      )}
      {(page === DashboardModalPages.CreateBoardModal ||
        page === DashboardModalPages.CreateTeamBoardModal) && (
        <CreateBoardModal onConfirm={close} onClose={close} />
      )}
      {page === DashboardModalPages.ViewBoardsModal && (
        <ViewBoardsModal onClose={close} />
      )}
      {page === DashboardModalPages.CreateAnnouncmentModal && (
        <CreateAnnouncmentModal onClose={close} />
      )}
      {page === DashboardModalPages.ViewAnnouncementModal && (
        <ViewAnnouncementsModal onClose={close} />
      )}
    </Modal>
  );
};

import { ModalHeader } from "../../headers";
import { Icons } from "../../icons";
import { useDashboardPage } from "../../../hooks";
import { AvatarCard } from "../../cards";
import { MenuButton, MenuButtonVariant } from "../../buttons";
import { abbreviateName } from "../../../utils";

export const MemberModal = () => {
  const { toggleModalOpen } = useDashboardPage();
  const {
    user,
    teamMembers,
    adminMembers,
    invitations,
    selectedMemberId,
    isInvitee,

    onCancelInvitation,
    onRemoveMember,
    onPromoteToAdmin,
    onDemoteFromAdmin,
  } = useDashboardPage();

  const isUserAdmin =
    adminMembers.find((m) => m.user.user_id === user?.userId) !== undefined;

  const member = teamMembers.find((m) => m.user.user_id === selectedMemberId);
  const isAdmin =
    !isInvitee &&
    adminMembers.find((m) => m.user.user_id === selectedMemberId) !== undefined;
  const isOnlyAdmin = adminMembers.length === 1;
  const invitee = invitations.find((m) => m.invitation_id === selectedMemberId);

  const memberFullName =
    member && (member.user.first_name || member.user.last_name)
      ? `${member.user.first_name} ${member.user.last_name}`.trim()
      : "";
  const memberTitle =
    memberFullName.length > 0 ? memberFullName : (member?.user.username ?? "");

  const invitationTitle = invitee?.recipient_email ?? "";

  const title = isInvitee ? invitationTitle : memberTitle;
  const abbreviated = (
    isInvitee
      ? title[0]
      : abbreviateName(
          member?.user.first_name ?? "",
          member?.user.last_name ?? "",
          member?.user.username[0] ?? "",
        )
  ).toUpperCase();

  return (
    <div className="full p-6 flex flex-col space-y-[30px]">
      <ModalHeader
        title="View Member"
        actions={[
          {
            type: "iconBtn",
            side: "left",
            iconBtnProps: {
              name: Icons.Close,
              onClick: () => toggleModalOpen(false),
            },
          },
        ]}
      />

      <div className="w-full flex justify-center">
        <div className="flex flex-row items-center space-x-[30px]">
          <AvatarCard title={abbreviated} />

          <div className="flex flex-col">
            <p className="text-xl font-bold">{title}</p>
            <p className="text-md">
              {isInvitee ? "Invited Member" : isAdmin ? "Admin" : "Team Member"}
            </p>
          </div>
        </div>
      </div>

      <div className="grow-1 flex flex-col  items-center space-y-[15px]">
        {isUserAdmin && member && !(isOnlyAdmin && isAdmin) && (
          <MenuButton
            onClick={() =>
              isAdmin
                ? onDemoteFromAdmin(selectedMemberId)
                : onPromoteToAdmin(selectedMemberId)
            }
            text={!isOnlyAdmin && isAdmin ? "Demote admin" : "Promote admin"}
          />
        )}

        {/* TODO: When removing a member if they have an invite which they likely will, should remove the invite */}
        {/* TODO: Ensure owner of the team or team creator cannot be removed ever */}
        {(isInvitee || !(isOnlyAdmin && isAdmin)) && isUserAdmin && (
          <MenuButton
            onClick={() =>
              isInvitee
                ? onCancelInvitation(selectedMemberId)
                : onRemoveMember(selectedMemberId)
            }
            text={isInvitee ? "Cancel invite" : "Remove from team"}
            variant={MenuButtonVariant.Destructive}
          />
        )}
      </div>
    </div>
  );
};

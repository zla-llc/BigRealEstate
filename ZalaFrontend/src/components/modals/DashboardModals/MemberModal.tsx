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
    selectedTeam,

    onCancelInvitation,
    onRemoveMember,
    onPromoteToAdmin,
    onDemoteFromAdmin,
  } = useDashboardPage();

  const viewingMember = teamMembers.find(
    (m) => m.user.user_id === selectedMemberId,
  );
  const isViewingMemberAdmin =
    !isInvitee &&
    adminMembers.find((m) => m.user.user_id === selectedMemberId) !== undefined;
  const isViewingMemberTeamOwner =
    viewingMember &&
    selectedTeam &&
    viewingMember?.user.user_id === selectedTeam?.created_by_user_id
      ? true
      : false;

  const invitee = invitations.find((m) => m.invitation_id === selectedMemberId);

  const isUserAdmin =
    adminMembers.find((m) => m.user.user_id === user?.userId) !== undefined;
  const isUserAlsoViewingMember =
    user && viewingMember && user.userId === viewingMember.user.user_id
      ? true
      : false;

  const isOnlyAdmin = adminMembers.length === 1;

  const viewingMemberFullName =
    viewingMember &&
    (viewingMember.user.first_name || viewingMember.user.last_name)
      ? `${viewingMember.user.first_name} ${viewingMember.user.last_name}`.trim()
      : "";
  const memberTitle =
    viewingMemberFullName.length > 0
      ? viewingMemberFullName
      : (viewingMember?.user.username ?? "");

  const invitationTitle = invitee?.recipient_email ?? "";

  const title = isInvitee ? invitationTitle : memberTitle;
  const abbreviated = (
    isInvitee
      ? title[0]
      : abbreviateName(
          viewingMember?.user.first_name ?? "",
          viewingMember?.user.last_name ?? "",
          viewingMember?.user.username[0] ?? "",
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
              {isInvitee
                ? "Invited Member"
                : isViewingMemberAdmin
                  ? isViewingMemberTeamOwner
                    ? "Team Owner"
                    : "Admin"
                  : "Team Member"}
            </p>
          </div>
        </div>
      </div>

      <div className="grow-1 flex flex-col  items-center space-y-[15px]">
        {/* {isUserAdmin &&
          viewingMember &&
          !(isOnlyAdmin && isViewingMemberAdmin) && (
            <MenuButton
              onClick={() =>
                isViewingMemberAdmin
                  ? onDemoteFromAdmin(selectedMemberId)
                  : onPromoteToAdmin(selectedMemberId)
              }
              text={
                !isOnlyAdmin && isViewingMemberAdmin
                  ? "Demote admin"
                  : "Promote admin"
              }
            />
          )} */}

        {isUserAdmin && !isViewingMemberAdmin && (
          <MenuButton
            onClick={() => onPromoteToAdmin(selectedMemberId)}
            text={"Promote admin"}
          />
        )}

        {!isViewingMemberTeamOwner &&
          !isUserAlsoViewingMember &&
          isUserAdmin &&
          isViewingMemberAdmin && (
            <MenuButton
              onClick={() => onDemoteFromAdmin(selectedMemberId)}
              text={"Demote admin"}
            />
          )}

        {/* TODO: When removing a member if they have an invite which they likely will, should remove the invite */}
        {/* TODO: Ensure owner of the team or team creator cannot be removed ever */}
        {/* TODO: Write out when a member can be removed / demoted / promoted and clean up the logic to be more readable */}
        {(isInvitee || !(isOnlyAdmin && isViewingMemberAdmin)) &&
          isUserAdmin &&
          !isViewingMemberTeamOwner &&
          !isUserAlsoViewingMember && (
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

import { UserListCard } from "../../../components";
import type { ITeamInvitation } from "../../../interfaces";
import type { UserListCardProps, DashboardCardButtonProps } from "./types";

type InvitedCardListProps = UserListCardProps & {
  invitations: ITeamInvitation[];
  button: DashboardCardButtonProps;
};

export const InvitedCardList = ({
  displayOverflowCount,
  spliceCount,
  invitations,
  button,
  onClick,
  onAdd,
}: InvitedCardListProps) => {
  return (
    <UserListCard
      title="Invited Members:"
      overflowCount={displayOverflowCount}
      users={invitations
        .map((invite) => ({
          title: invite.recipient_email[0].toUpperCase(),
          tooltip: {
            title: invite.recipient_email,
            subtitle: invite.status ? "Accepted" : "Waiting",
          },
        }))
        .splice(0, spliceCount)}
      onClick={onClick}
      btnProps={
        button.visible
          ? { text: button.text, onClick: button.onClick }
          : undefined
      }
      onAdd={onAdd}
    />
  );
};

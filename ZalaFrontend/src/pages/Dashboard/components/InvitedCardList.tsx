import { forwardRef } from "react";
import { UserListCard } from "../../../components";
import type { ITeamInvitation } from "../../../interfaces";
import type { UserListCardProps, DashboardCardButtonProps } from "./types";

type InvitedCardListProps = UserListCardProps & {
  invitations: ITeamInvitation[];
  button: DashboardCardButtonProps;
};

export const InvitedCardList = forwardRef<HTMLDivElement, InvitedCardListProps>(
  (
    { displayOverflowCount, spliceCount, invitations, button, onClick, onAdd },
    ref,
  ) => {
    return (
      <UserListCard
        ref={ref}
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
  },
);

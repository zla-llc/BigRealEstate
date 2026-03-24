import type { ITeamMember } from "../../../interfaces";
import type { UserListCardProps, DashboardCardButtonProps } from "./types";
import { abbreviateName } from "../../../utils";
import { UserListCard } from "../../../components";
import { forwardRef } from "react";

type TeamCardListProps = UserListCardProps & {
  members: ITeamMember[];
  button: DashboardCardButtonProps;
};

export const TeamCardList = forwardRef<HTMLDivElement, TeamCardListProps>(
  (
    { displayOverflowCount, spliceCount, members, button, onClick, onAdd },
    ref,
  ) => {
    return (
      <UserListCard
        ref={ref}
        title="Team Members:"
        overflowCount={displayOverflowCount}
        users={members
          .map((member) => ({
            title: abbreviateName(
              member.user.first_name ?? "",
              member.user.last_name ?? "",
              member.user.username[0],
            ),
            tooltip: {
              title: member.user.username,
              subtitle:
                member.user.first_name || member.user.last_name
                  ? `${member.user.first_name} ${member.user.last_name}`.trim()
                  : undefined,
            },
            borderColor: member.role === "admin" ? "#F59E0B" : "#3B82F6",
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

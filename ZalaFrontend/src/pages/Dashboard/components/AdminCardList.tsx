import { UserListCard } from "../../../components";
import type { DashboardCardButtonProps, UserListCardProps } from "./types";
import type { ITeamMember } from "../../../interfaces";
import { abbreviateName } from "../../../utils";
import { forwardRef } from "react";

type AdminCardListProps = UserListCardProps & {
  members: ITeamMember[];
  button: DashboardCardButtonProps;
};

export const AdminCardList = forwardRef<HTMLDivElement, AdminCardListProps>(
  ({ displayOverflowCount, spliceCount, members, button, onClick }, ref) => {
    return (
      <UserListCard
        ref={ref}
        title="Admins:"
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
            borderColor: "#F59E0B",
          }))
          .splice(0, spliceCount)}
        onClick={onClick}
        btnProps={
          button.visible
            ? { text: button.text, onClick: button.onClick }
            : undefined
        }
        // onAdd={() => {}}
      />
    );
  },
);

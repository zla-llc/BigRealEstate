import { UserListCard } from "../../../components";
import type { DashboardCardButtonProps, UserListCardProps } from "./types";
import type { TeamMember } from "../../../interfaces";
import { abbreviateName } from "../../../utils";

type AdminCardListProps = UserListCardProps & {
  members: TeamMember[];
  button: DashboardCardButtonProps;
};

export const AdminCardList = ({
  displayOverflowCount,
  spliceCount,
  members,
  button,
  onClick,
}: AdminCardListProps) => {
  return (
    <UserListCard
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
};

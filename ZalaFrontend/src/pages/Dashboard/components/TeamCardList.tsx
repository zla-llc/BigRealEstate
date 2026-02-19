import type { ITeamMember } from "../../../interfaces";
import type { UserListCardProps, DashboardCardButtonProps } from "./types";
import { abbreviateName } from "../../../utils";
import { UserListCard } from "../../../components";

type TeamCardListProps = UserListCardProps & {
  members: ITeamMember[];
  button: DashboardCardButtonProps;
};

export const TeamCardList = ({
  displayOverflowCount,
  spliceCount,
  members,
  button,
  onClick,
  onAdd,
}: TeamCardListProps) => {
  return (
    <UserListCard
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

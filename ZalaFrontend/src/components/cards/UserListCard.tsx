import clsx from "clsx";
import { TooltipContainer } from "../feedback";
import { DashboardCard, type DashboardCardProps } from "./DashboardCard";
import { AvatarCard } from "./AvatarCard";

type UserCircle = {
  title: string;
  tooltip?: { title: string; subtitle?: string };
};

type UserListCardProps = DashboardCardProps & {
  users: UserCircle[];
  overflowCount: number;
  onClick?: (index: number) => void;
};

type UserCardProps = {
  title?: string;
  hoverable?: boolean;
  user?: UserCircle;
  onClick?: () => void;
};

export const UserListCard = (props: UserListCardProps) => {
  const { users, overflowCount, onClick = () => {} } = props;
  return (
    <DashboardCard {...props}>
      <div className="flex flex-row justify-center flex-wrap gap-[30px] ">
        {users.map((user, i) => (
          <UserCard key={i} user={user} onClick={() => onClick(i)} />
        ))}

        {overflowCount > 0 && (
          <UserCard hoverable={false} title={`+${overflowCount}`} />
        )}
      </div>
    </DashboardCard>
  );
};

const UserCard = ({
  user,
  title,
  onClick,
  hoverable = true,
}: UserCardProps) => {
  return (
    (title || user) && (
      <div
        className={clsx(
          hoverable ? "hover:-translate-y-[10px] duration-75" : "",
        )}
      >
        {user && !title && (
          <TooltipContainer
            titles={
              user.tooltip
                ? { title: user.tooltip.title, subTitle: user.tooltip.subtitle }
                : undefined
            }
          >
            <AvatarCard onClick={onClick} title={user.title} />
          </TooltipContainer>
        )}
        {title && !user && <AvatarCard title={title} />}
      </div>
    )
  );
};

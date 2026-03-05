import clsx from "clsx";
import { TooltipContainer } from "../feedback";
import { DashboardCard, type DashboardCardProps } from "./DashboardCard";
import { AvatarCard } from "./AvatarCard";
import { forwardRef } from "react";

type UserCircle = {
  title: string;
  tooltip?: { title: string; subtitle?: string };
  borderColor?: string;
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

export const UserListCard = forwardRef<HTMLDivElement, UserListCardProps>(
  (props, ref) => {
    const { users, overflowCount, onClick } = props;
    return (
      <DashboardCard ref={ref} {...props}>
        <div className="flex flex-row justify-center flex-wrap gap-[30px] ">
          {users.map((user, i) => (
            <UserCard
              key={i}
              user={user}
              onClick={onClick ? () => onClick(i) : undefined}
            />
          ))}

          {overflowCount > 0 && (
            <UserCard hoverable={false} title={`+${overflowCount}`} />
          )}
        </div>
      </DashboardCard>
    );
  },
);

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
            <AvatarCard
              onClick={onClick}
              title={user.title}
              borderColor={user.borderColor}
            />
          </TooltipContainer>
        )}
        {title && !user && <AvatarCard title={title} />}
      </div>
    )
  );
};

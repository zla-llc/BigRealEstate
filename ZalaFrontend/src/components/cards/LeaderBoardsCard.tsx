import { forwardRef } from "react";
import { OverflowText } from "../feedback";
import { DashboardCard, type DashboardCardProps } from "./DashboardCard";
import { LeaderboardItemCard } from "./LeaderboardItemCard";

type LeaderBoardUserProps = {
  title: string;
  xp: number;
};

type LeaderBoardsCardProps = DashboardCardProps & {
  users: LeaderBoardUserProps[];
  overflowCount: number;
  onClick?: (i: number) => void;
};

export const LeaderBoardsCard = forwardRef<
  HTMLDivElement,
  LeaderBoardsCardProps
>((props, ref) => {
  const { users, overflowCount, onClick = () => {} } = props;

  return (
    <DashboardCard ref={ref} {...props}>
      <div className="w-full flex flex-col gap-y-3.75">
        <div className="flex flex-col gap-y-7.5">
          {users.map((usr, i) => (
            <LeaderboardItemCard
              key={i}
              title={usr.title}
              xp={usr.xp}
              place={i + 1}
              onClick={() => onClick(i)}
            />
          ))}
        </div>

        <OverflowText overflowCount={overflowCount} />
      </div>
    </DashboardCard>
  );
});

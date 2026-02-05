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

export const LeaderBoardsCard = (props: LeaderBoardsCardProps) => {
  const { users, overflowCount, onClick = () => {} } = props;
  const sortedUsers = users.sort((a, b) => a.xp - b.xp);

  return (
    <DashboardCard {...props}>
      <div className="w-full flex flex-col gap-y-[15px]">
        <div className="flex flex-col gap-y-[30px]">
          {sortedUsers.map((usr, i) => (
            <LeaderboardItemCard
              key={i}
              title={usr.title}
              xp={usr.xp}
              place={i + 1}
              onClick={() => onClick(i)}
            />
          ))}
        </div>

        {overflowCount > 0 ? (
          <div className="flex justify-center items-center">
            + {overflowCount} More
          </div>
        ) : (
          <div />
        )}
      </div>
    </DashboardCard>
  );
};

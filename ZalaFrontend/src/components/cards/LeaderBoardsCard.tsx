import { useEffect, useState } from "react";
import { DashboardCard, type DashboardCardProps } from "./DashboardCard";
import { ordinals, Random } from "../../utils";

type LeaderBoardsCardProps = DashboardCardProps & {
  users: string[];
};

export const LeaderBoardsCard = (props: LeaderBoardsCardProps) => {
  const { users } = props;
  const [dummyUsers, setDummyUsers] = useState<
    { id: number; user: string; xp: number }[]
  >([]);
  useEffect(() => {
    setDummyUsers(
      users
        .map((usr, i) => ({ id: i, user: usr, xp: Random.inclusive(0, 1000) }))
        .sort((a, b) => b.xp - a.xp),
    );
  }, []);
  return (
    <DashboardCard {...props}>
      <div className="w-full flex flex-col gap-y-[30px]">
        {dummyUsers.map((usr, i) => (
          <div
            key={usr.id}
            className="flex flex-row justify-between items-center card-base-secondary box-shadow p-[15px]"
          >
            <div>
              <p className="text-lg font-bold text-secondary">{usr.user}</p>
              <p className="text-sm font-bold text-secondary-50">{usr.xp} XP</p>
            </div>
            <p className="text-lg font-bold text-secondary">
              {ordinals(i + 1)}
            </p>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

import { DashboardCard, type DashboardCardProps } from "./DashboardCard";

type UserListCardProps = DashboardCardProps & {
  users: string[];
};

export const UserListCard = (props: UserListCardProps) => {
  const avatarSize = 75;
  const { users } = props;
  return (
    <DashboardCard {...props}>
      <div className="flex flex-row overflow-x-scroll gap-[30px]">
        {users.map(
          (user, i) =>
            user && (
              <div
                key={i}
                style={{
                  minWidth: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize,
                }}
                className="flex items-center justify-center card-base-secondary text-xl font-bold"
              >
                {user}
              </div>
            ),
        )}
      </div>
    </DashboardCard>
  );
};

import { useLeaderBoardGlobalModal } from "../../../hooks";
import { IconButtonVariant } from "../../buttons";
import { LeaderboardItemCard } from "../../cards";
import { Loader } from "../../feedback";
import { ModalHeader } from "../../headers";
import { Icons } from "../../icons";

type LeaderBoardGlobalModalProps = {
  onClose?: () => void;
};

export const LeaderBoardGlobalModal = ({
  onClose,
}: LeaderBoardGlobalModalProps) => {
  const {
    allTeams,
    allUsers,
    compareTo,

    allTeamsLoading,
    allUsersLoading,

    onTeamsClick,
    onUsersClick,
  } = useLeaderBoardGlobalModal();
  return (
    <div className="full p-6 flex flex-col space-y-7.5">
      <ModalHeader
        title={`ZLA Leaderboards`}
        subtitle={compareTo === "teams" ? "Team v Team" : "User v User"}
        actions={[
          onClose
            ? {
                type: "iconBtn",
                side: "left",
                iconBtnProps: {
                  name: Icons.Close,
                  onClick: onClose,
                },
              }
            : null,
          {
            type: "iconBtn",
            side: "right",
            iconBtnProps: {
              name: Icons.Group,
              variant:
                compareTo === "teams" ? IconButtonVariant.Accent : undefined,
              onClick: onTeamsClick,
            },
          },
          {
            type: "iconBtn",
            side: "right",
            iconBtnProps: {
              name: Icons.User,
              variant:
                compareTo === "users" ? IconButtonVariant.Accent : undefined,
              onClick: onUsersClick,
            },
          },
        ]}
      />

      {((compareTo === "teams" && allTeamsLoading) ||
        (compareTo === "users" && allUsersLoading)) && (
        <div className="grow flex justify-center items-center">
          <Loader text="" darkMode={true} />
        </div>
      )}

      {compareTo === "teams" && (
        <div className="grow flex flex-col space-y-7.5">
          {allTeams.map((team, i) => (
            <LeaderboardItemCard
              key={i}
              title={team.team_name}
              xp={team.xp}
              place={i + 1}
            />
          ))}
        </div>
      )}

      {compareTo === "users" && (
        <div className="grow flex flex-col space-y-7 5">
          {allUsers.map((user, i) => (
            <LeaderboardItemCard
              key={i}
              title={user.username}
              xp={user.xp}
              place={i + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

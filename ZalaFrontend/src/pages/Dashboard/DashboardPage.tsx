import {
  AnnouncmentsCard,
  BoardsListCard,
  DashboardModals,
  EditablePageHeader,
  LeaderBoardsCard,
  PropertiesListCard,
} from "../../components";
import { useDashboardPage } from "../../hooks";
import { LoadingPage } from "../Loading";
import { AdminCardList, InvitedCardList, TeamCardList } from "./components";

export const DashboardPage = () => {
  const {
    newTeamName,
    setNewTeamName,

    selectedTeam,
    adminMembers,
    isUserAdmin,
    teamMembers,
    leaderboardMembers,

    invitations,

    userProperties,
    userBoards,

    openTeamInvitationModal,
    openViewMemberModal,
    openLeaderboardModal,
    openCreatePropertyModal,
    openViewPropertiesModal,
    openCreateBoardModal,
    openViewBoardsModal,

    onPropertyCardClick,
    onBoardClick,

    setSelectedMemberId,

    displayOverflow,
    overflow,
    sliceCount,

    showAllInCards,
  } = useDashboardPage();

  const AdminComponent = () => (
    <AdminCardList
      displayOverflowCount={displayOverflow.admin}
      overflowCount={overflow.admin}
      spliceCount={sliceCount.admin}
      members={adminMembers}
      button={{
        visible: overflow.admin > 0,
        text: showAllInCards.admins.all ? "View less" : "View all",
        onClick: showAllInCards.admins.toggle,
      }}
      onClick={(i) => (
        setSelectedMemberId(adminMembers[i].user.user_id, false),
        openViewMemberModal()
      )}
    />
  );

  const InvitationComponent = () => (
    <InvitedCardList
      displayOverflowCount={displayOverflow.invitations}
      overflowCount={overflow.invitations}
      spliceCount={sliceCount.invitations}
      invitations={invitations}
      button={{
        visible: overflow.invitations > 0,
        text: showAllInCards.invitations.all ? "View less" : "View all",
        onClick: showAllInCards.invitations.toggle,
      }}
      onClick={(i) => (
        setSelectedMemberId(invitations[i].invitation_id, true),
        openViewMemberModal()
      )}
      onAdd={openTeamInvitationModal}
    />
  );

  const TeamMemberComponent = () => (
    <TeamCardList
      displayOverflowCount={displayOverflow.teamMembers}
      overflowCount={overflow.teamMembers}
      spliceCount={sliceCount.teamMembers}
      members={teamMembers}
      button={{
        visible: overflow.teamMembers > 0,
        text: showAllInCards.teamMembers.all ? "View less" : "View all",
        onClick: showAllInCards.teamMembers.toggle,
      }}
      onClick={(i) => (
        setSelectedMemberId(teamMembers[i].user.user_id, false),
        openViewMemberModal()
      )}
      onAdd={openTeamInvitationModal}
    />
  );

  return (
    <div className="flex flex-col gap-y-[60px] flex-1 p-[60px] overflow-y-scroll">
      <div className="w-full px-[60px]">
        <EditablePageHeader
          title="Team Name:"
          value={newTeamName}
          setValue={setNewTeamName}
          inputProps={{ placeholder: "Ex: The best team ever" }}
        />
      </div>

      {!selectedTeam && (
        <div className="grow-1 flex justify-center items-center">
          <LoadingPage text="" />
        </div>
      )}

      {selectedTeam && (
        <div className="gap-y-[60px] flex flex-col flex-1">
          <div className="flex flex-row gap-x-[60px]">
            <div className="flex-1">
              <AdminComponent />
            </div>
            <div className="flex-1">
              {isUserAdmin && <InvitationComponent />}
              {!isUserAdmin && <TeamMemberComponent />}
            </div>
          </div>

          {isUserAdmin && (
            <div className="flex">
              <TeamMemberComponent />
            </div>
          )}

          <div className="flex flex-row gap-x-[60px]">
            <div className="w-[70%]">
              <AnnouncmentsCard
                title="Announcments:"
                messages={Array(4)
                  .fill(1)
                  .map((_, i) => ({
                    messageId: i,
                    title: "Announcment " + i,
                    message: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
                  }))}
                onAdd={() => {}}
                btnProps={{ text: "View all" }}
              />
            </div>
            <div className="flex-grow">
              <LeaderBoardsCard
                title="Team Leaderboard:"
                overflowCount={overflow.leaderboard}
                btnProps={
                  overflow.leaderboard > 0
                    ? { text: "View all", onClick: openLeaderboardModal }
                    : undefined
                }
                users={[...leaderboardMembers].splice(
                  0,
                  sliceCount.leaderboard + 1,
                )}
                onClick={(i) => (
                  setSelectedMemberId(leaderboardMembers[i].id, false),
                  openViewMemberModal()
                )}
              />
            </div>
          </div>

          <div className="flex flex-row gap-[60px]">
            <div className="flex-1">
              <PropertiesListCard
                properties={[]}
                title="Team Properties:"
                // onAdd={() => {}}
                // btnProps={{ text: "View all" }}
              />
            </div>
            <div className="flex-1">
              <PropertiesListCard
                overflowCount={overflow.property}
                properties={[...userProperties].splice(
                  0,
                  sliceCount.property + 1,
                )}
                title="My Properties:"
                onAdd={openCreatePropertyModal}
                btnProps={
                  overflow.property > 0
                    ? {
                        text: "View all",
                        onClick: openViewPropertiesModal(userProperties),
                      }
                    : undefined
                }
                onClick={onPropertyCardClick}
              />
            </div>
          </div>

          <div className="flex flex-row gap-[60px]">
            <div className="flex-1">
              <BoardsListCard boards={[]} title="Team Boards:" />
            </div>
            <div className="flex-1">
              <BoardsListCard
                overflowCount={overflow.boards}
                boards={[...userBoards].splice(0, sliceCount.boards + 1)}
                title="My Boards:"
                btnProps={
                  overflow.leaderboard > 0
                    ? {
                        text: "View all",
                        onClick: openViewBoardsModal(userBoards, `My Boards:`),
                      }
                    : undefined
                }
                onClick={onBoardClick}
                onAdd={openCreateBoardModal}
              />
            </div>
          </div>
        </div>
      )}

      <DashboardModals />
    </div>
  );
};

import {
  DashboardAnnouncementsCard,
  BoardsListCard,
  Button,
  DashboardModals,
  EditablePageHeader,
  LeaderBoardsCard,
  PropertiesListCard,
  TextInput,
} from "../../components";
import { useDashboardPage } from "../../hooks";
import { LoadingPage } from "../Loading";
import { AdminCardList, InvitedCardList, TeamCardList } from "./components";
import transition from "../../utils/transitions/transition";

const DashboardPage = () => {
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

    teamProperties,
    teamBoards,

    announcements,

    openTeamInvitationModal,
    openViewMemberModal,
    openLeaderboardModal,
    openCreatePropertyModal,
    openViewPropertiesModal,
    openCreateBoardModal,
    openViewBoardsModal,
    openCreateAnnouncmentModal,
    openViewAnnouncementsModal,
    onAddTeamPropertyClick,
    openViewTeamPropertiesModal,

    onPropertyCardClick,
    onCreateTeam,
    onBoardClick,
    onDeleteAnnouncement,
    onEditAnnouncementClick,
    onAddTeamBoardClick,

    setSelectedMemberId,

    displayOverflow,
    overflow,
    sliceCount,

    loading,

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
    <div className="flex flex-col gap-y-[60px] flex-1 p-[60px]">
      {selectedTeam && (
        <div className="w-full px-[60px]">
          <EditablePageHeader
            title="Team Name:"
            nonEditableText={newTeamName}
            value={newTeamName}
            setValue={setNewTeamName}
            editable={isUserAdmin}
            inputProps={{ placeholder: "Ex: The best team ever" }}
          />
        </div>
      )}

      {loading.loadingTeams && !selectedTeam && (
        <div className="grow-1 flex justify-center items-center">
          <LoadingPage text="" />
        </div>
      )}

      {!loading.loadingTeams && !selectedTeam && (
        <div className="grow-1 flex flex-col justify-center items-center">
          <div className="card-base box-shadow p-[30px] flex flex-col justify-center items-center space-y-[30px]">
            <div className="w-full flex flex-col justify-center items-center space-y-[15px]">
              <div className=" flex flex-col justify-center items-center">
                <p className="text-sm text-secondary-50">
                  You do not have a team yet.
                </p>
                <p className="text-lg font-bold">Create a new team</p>
              </div>
              <div className="w-full">
                <TextInput
                  value={newTeamName}
                  setValue={setNewTeamName}
                  label="Team Name"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center items-center">
              <p className="text-md text-secondary-50">or</p>
              <p className="text-md">
                Please reach out to your admin to recieve an invite.
              </p>
            </div>

            <div className="flex flex-col justify-center items-center">
              <div className="w-[300px]">
                <Button
                  onClick={onCreateTeam}
                  text="Create team"
                  disabled={newTeamName.length === 0}
                />
              </div>
            </div>
          </div>
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
              <DashboardAnnouncementsCard
                title="announcements:"
                overflowCount={overflow.announcements}
                messages={[...announcements].splice(
                  0,
                  sliceCount.announcements + 1,
                )}
                onAdd={isUserAdmin ? openCreateAnnouncmentModal : undefined}
                btnProps={
                  overflow.announcements > 0
                    ? { text: "View all", onClick: openViewAnnouncementsModal }
                    : undefined
                }
                onEdit={onEditAnnouncementClick}
                onTrash={onDeleteAnnouncement}
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
                overflowCount={overflow.teamProperties}
                properties={[...teamProperties.current].splice(
                  0,
                  sliceCount.teamProperties + 1,
                )}
                title="Team Properties:"
                btnProps={
                  overflow.teamProperties > 0
                    ? {
                        text: "View all",
                        onClick: openViewTeamPropertiesModal,
                      }
                    : undefined
                }
                onAdd={isUserAdmin ? onAddTeamPropertyClick : undefined}
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
                        onClick: openViewPropertiesModal,
                      }
                    : undefined
                }
                onClick={onPropertyCardClick}
              />
            </div>
          </div>

          <div className="flex flex-row gap-[60px]">
            <div className="flex-1">
              <BoardsListCard
                boards={teamBoards.current}
                title="Team Boards:"
                onClick={onBoardClick}
                onAdd={isUserAdmin ? onAddTeamBoardClick : undefined}
              />
            </div>
            <div className="flex-1">
              <BoardsListCard
                overflowCount={overflow.boards}
                boards={[...userBoards].splice(0, sliceCount.boards + 1)}
                title="My Boards:"
                btnProps={
                  overflow.boards > 0
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
export default transition(DashboardPage);
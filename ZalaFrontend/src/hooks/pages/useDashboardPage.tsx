import { useEffect, useRef } from "react";
import { useTeamInvitePage } from "./useTeamInvitePage";
import {
  useAppNavigation,
  useBoolean,
  useOverflow,
  useTimeoutEffect,
} from "../utils";
import {
  DashboardModalPages,
  useCreatePropertyStore,
  useDashboardModalStore,
  useLeaderboardModalStore,
  useViewBoardsModalStore,
  useViewPropertiesModalStore,
} from "../../stores";
import type {
  IKanbanBoard,
  IProperty,
  LeaderboardItem,
} from "../../interfaces";
import { teamMemberFullName } from "../../utils";
import { useUserBoards, useUserProperties } from "../api";

const MAX_ADMIN_COUNT = 4;
const MAX_INVITE_COUNT = 4;
const MAX_MEMBER_COUNT = 8;

const MAX_LEADERBOARD_COUNT = 5;
const MAX_PROPERTY_COUNT = 4;
const MAX_BOARD_COUNT = 3;

export const useDashboardPage = () => {
  const { toBoardPage } = useAppNavigation();

  const {
    api,
    actions: {
      onSelectTeam,
      onInvite,
      onCancelInvitation,
      onRemoveMember,
      onPromoteToAdmin,
      onDemoteFromAdmin,
      onCreateTeam,
    },
    forms: { newTeamName, setNewTeamName, inviteEmail, setInviteEmail },
    invitations,
    teamMembersWithXp,
    user,
    teams,
    selectedTeam,
    selectedMemberId,
    isInvitee,
    loading,
    setSelectedMemberId,
  } = useTeamInvitePage();

  const {
    isOpen,
    toggle: toggleModalOpen,
    page,
    setPage,
  } = useDashboardModalStore();
  const {
    setTitle: setLeaderboardTitle,
    setItems,
    setOnItemClick,
  } = useLeaderboardModalStore();
  const { setProperties, setOnClick: setOnViewPropertyClick } =
    useViewPropertiesModalStore();
  const {
    setBoards,
    setOnClick,
    setTitle: setViewBoardsTitle,
  } = useViewBoardsModalStore();

  const { setEditingProperty } = useCreatePropertyStore();

  const [userProperties] = useUserProperties({
    userId: user ? user.userId : -1,
    deps: [page === DashboardModalPages.CreateProperty && !isOpen],
  });
  const [userBoards] = useUserBoards({
    userId: user ? user.userId : -1,
    deps: [page === DashboardModalPages.CreateBoardModal && !isOpen],
  });

  const [showAllTeamMembers, _itmo, _itmc, toggleAllTeamMembers] = useBoolean();
  const [showAllAdmin, _iao, _iac, toggleAllAdmin] = useBoolean();
  const [showAllInvites, _io, _ic, toggleAllInvites] = useBoolean();

  const teamMembers = selectedTeam?.members ?? [];
  const adminMembers = teamMembers.filter((member) => member.role === "admin");
  const isUserAdmin =
    adminMembers.find((member) => member.user.user_id === user?.userId) !==
    undefined;
  const leaderboardMembers: LeaderboardItem[] = teamMembersWithXp.map(
    (member) => ({
      id: member.user_id,
      xp: member.xp,
      title: teamMemberFullName(
        teamMembers.find((tm) => tm.user.user_id === member.user_id),
        member.username,
      ),
    }),
  );

  const [
    invitationsOverflow,
    invitationsSliceCount,
    invitationsDisplayOverflow,
  ] = useOverflow(MAX_INVITE_COUNT, invitations.length, showAllInvites);
  const [
    teamMembersOverflow,
    teamMembersSliceCount,
    teamMembersDisplayOverflow,
  ] = useOverflow(
    isUserAdmin ? MAX_MEMBER_COUNT : MAX_INVITE_COUNT,
    teamMembers.length,
    showAllTeamMembers,
  );
  const [adminOverflow, adminSliceCount, adminDisplayOverflow] = useOverflow(
    MAX_ADMIN_COUNT,
    adminMembers.length,
    showAllAdmin,
  );

  const [
    leaderboardOverflow,
    leaderboardSliceCount,
    leaderboardDisplayOverflow,
  ] = useOverflow(MAX_LEADERBOARD_COUNT, teamMembersWithXp.length, false);
  const [propertyOverflow, propertySliceCount, propertyDisplayOverflow] =
    useOverflow(MAX_PROPERTY_COUNT, userProperties.length, false);
  const [boardsOverflow, boardsSliceCount, boardsDisplayOverflow] = useOverflow(
    MAX_BOARD_COUNT,
    userBoards.length,
    false,
  );

  const { location } = useAppNavigation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [location.key]);

  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      onSelectTeam(teams[0]);
      setNewTeamName(teams[0].team_name);
    }
  }, [teams.length]);

  useTimeoutEffect(
    () => {
      if (!selectedTeam) return;

      updateTeamName();
    },
    [newTeamName],
    250,
  );

  const updateTeamName = async () => {
    if (!selectedTeam) return;

    const response = await api.updateTeam({
      team_id: selectedTeam.team_id,
      team_name: newTeamName,
      xp: selectedTeam.xp,
    });

    if (response.data) {
      onSelectTeam(response.data);
    }
  };

  const openTeamInvitationModal = () => {
    setPage(DashboardModalPages.InviteMemberModal);
    toggleModalOpen();
  };

  const openViewMemberModal = (forceModalOpen = true) => {
    setPage(DashboardModalPages.ViewMemberModal);
    toggleModalOpen(forceModalOpen);
  };

  const openLeaderboardModal = () => {
    setPage(DashboardModalPages.LeaderboardModal);
    setLeaderboardTitle(`Team Leaderboard`);
    setItems(leaderboardMembers);
    setOnItemClick(
      (userId) => (
        setSelectedMemberId(userId, false),
        openViewMemberModal(true)
      ),
    );
    toggleModalOpen();
  };

  const openCreatePropertyModal = () => {
    setPage(DashboardModalPages.CreateProperty);
    toggleModalOpen(true);
  };

  const openViewPropertiesModal = (properties: IProperty[]) => () => {
    setProperties(properties);
    setOnViewPropertyClick((propertyId) =>
      onPropertyCardClick(propertyId, "custom", properties),
    );
    setPage(DashboardModalPages.ViewPropertiesModal);
    toggleModalOpen(true);
  };

  const openCreateBoardModal = () => {
    setPage(DashboardModalPages.CreateBoardModal);
    toggleModalOpen(true);
  };

  const openViewBoardsModal =
    (boards: IKanbanBoard[], title: string = "View Boards") =>
    () => {
      setViewBoardsTitle(title);
      setBoards(boards);
      setOnClick((boardId) => {
        setBoards([]);
        toggleModalOpen(false);
        onBoardClick(boardId);
      });
      setPage(DashboardModalPages.ViewBoardsModal);
      toggleModalOpen(true);
    };

  const onPropertyCardClick = (
    propertyId: number,
    type: "team" | "user" | "custom" = "user",
    forceProperties?: IProperty[],
  ) => {
    const property = (
      forceProperties
        ? forceProperties
        : type === "team"
          ? userProperties
          : userProperties
    ).find((prop) => prop.propertyId === propertyId);
    setEditingProperty(property);
    openCreatePropertyModal();
  };

  const onBoardClick = (boardId: number) => toBoardPage(boardId);

  return {
    newTeamName,
    setNewTeamName,
    inviteEmail,
    setInviteEmail,

    selectedTeam,
    user,
    leaderboardMembers,
    teamMembers,
    adminMembers,
    isUserAdmin,

    userProperties,
    userBoards,

    invitations,
    selectedMemberId,
    isInvitee,
    setSelectedMemberId,

    toggleModalOpen,
    onInvite,
    openTeamInvitationModal,
    openViewMemberModal,
    openLeaderboardModal,
    openCreatePropertyModal,
    openViewPropertiesModal,
    openCreateBoardModal,
    openViewBoardsModal,

    onCancelInvitation,
    onRemoveMember,
    onPromoteToAdmin,
    onDemoteFromAdmin,
    onPropertyCardClick,
    onBoardClick,
    onCreateTeam,

    displayOverflow: {
      invitations: invitationsDisplayOverflow,
      teamMembers: teamMembersDisplayOverflow,
      admin: adminDisplayOverflow,

      leaderboard: leaderboardDisplayOverflow,
      property: propertyDisplayOverflow,
      boards: boardsDisplayOverflow,
    },

    overflow: {
      invitations: invitationsOverflow,
      teamMembers: teamMembersOverflow,
      admin: adminOverflow,

      leaderboard: leaderboardOverflow,
      property: propertyOverflow,
      boards: boardsOverflow,
    },

    sliceCount: {
      invitations: invitationsSliceCount,
      teamMembers: teamMembersSliceCount,
      admin: adminSliceCount,

      leaderboard: leaderboardSliceCount,
      property: propertySliceCount,
      boards: boardsSliceCount,
    },

    loading,
    scrollRef,

    showAllInCards: {
      invitations: {
        all: showAllInvites,
        toggle: toggleAllInvites,
      },
      admins: {
        all: showAllAdmin,
        toggle: toggleAllAdmin,
      },
      teamMembers: {
        all: showAllTeamMembers,
        toggle: toggleAllTeamMembers,
      },
    },
  };
};

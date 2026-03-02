import { useEffect, useRef, useState } from "react";
import { useTeamInvitePage } from "./useTeamInvitePage";
import {
  useAppNavigation,
  useBoolean,
  useOverflow,
  useSnack,
  useTimeoutEffect,
} from "../utils";
import {
  DashboardModalPages,
  GlobalModalPage,
  useCreatePropertyStore,
  useDashboardModalStore,
  useEditingFormStore,
  useGlobalModalStore,
  useLeaderboardModalStore,
  useSelectedIdsStore,
  useSelectedIdStore,
  useViewBoardsModalStore,
  useViewPropertiesModalStore,
  useViewPropertyModalControlStore,
} from "../../stores";
import {
  AKanbanBoardToIKanbanBoard,
  APropertyToIProperty,
  type IKanbanBoard,
  type IProperty,
  type LeaderboardItem,
} from "../../interfaces";
import { stringify, teamMemberFullName } from "../../utils";
import { useAlterUserXp, useUserBoards, useUserProperties } from "../api";
import { Icons } from "../../components";

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
      loadTeams,
      onSelectTeam,
      onInvite,
      onCancelInvitation,
      onRemoveMember,
      onPromoteToAdmin,
      onDemoteFromAdmin,
      onCreateTeam,
      onPostAnnouncement,
      onDeleteAnnouncement,
      onUpdateAnnouncement,
    },
    forms: {
      newTeamName,
      setNewTeamName,
      inviteEmail,
      setInviteEmail,
      announcementMessage,
      announcementTitle,
      setAnnouncementMessage,
      setAnnouncementTitle,
    },
    announcements,
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

  const [successMsg, errorMsg] = useSnack();
  const alterUserXP = useAlterUserXp();

  const selectedIdStore = useSelectedIdStore();
  const selectedIdsStore = useSelectedIdsStore();

  const globalModalStore = useGlobalModalStore();

  const viewPropertyModalControlStore = useViewPropertyModalControlStore();

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
  const viewPropertiesModalStore = useViewPropertiesModalStore();
  const viewBoardsModalStore = useViewBoardsModalStore();
  const {
    announcementId,
    setKey,
    clearKey,
    clearAll: clearAllEditingForms,
  } = useEditingFormStore();

  const { setEditingProperty } = useCreatePropertyStore();

  const [userProperties, _, __, userPropertiesRef] = useUserProperties({
    userId: user ? user.userId : -1,
    deps: [page === DashboardModalPages.CreateProperty && !isOpen],
  });
  const [userBoards, _setUserBoards, reloadUserBoards] = useUserBoards({
    userId: user ? user.userId : -1,
    deps: [page === DashboardModalPages.CreateBoardModal && !isOpen],
  });

  const teamProperties = useRef<IProperty[]>([]);
  const teamBoards = useRef<IKanbanBoard[]>([]);

  const [showAllTeamMembers, _itmo, _itmc, toggleAllTeamMembers] = useBoolean();
  const [showAllAdmin, _iao, _iac, toggleAllAdmin] = useBoolean();
  const [showAllInvites, _io, _ic, toggleAllInvites] = useBoolean();

  const teamMembers = selectedTeam?.members ?? [];
  const adminMembers = teamMembers.filter((member) => member.role === "admin");
  const isUserAdmin =
    adminMembers.find((member) => member.user.user_id === user?.userId) !==
    undefined;
  const leaderboardMembersMapped: LeaderboardItem[] = teamMembersWithXp.map(
    (member) => ({
      id: member.user_id,
      xp: member.xp,
      title: teamMemberFullName(
        teamMembers.find((tm) => tm.user.user_id === member.user_id),
        member.username,
      ),
    }),
  );
  const [leaderboardMembers, setLeaderboardMembers] = useState<
    LeaderboardItem[]
  >([]);

  useEffect(() => {
    const sorted = [...leaderboardMembersMapped].sort((a, b) => b.xp - a.xp);
    setLeaderboardMembers(sorted);
  }, [leaderboardMembersMapped.length]);

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

  const [
    announcementOverflow,
    announcementSliceCount,
    announcementDisplayOverflow,
  ] = useOverflow(MAX_PROPERTY_COUNT, announcements.length, false);
  const [
    teamPropertiesOverflow,
    teamPropertiesSliceCount,
    teamPropertiesDisplayOverflow,
  ] = useOverflow(MAX_PROPERTY_COUNT, teamProperties.current.length, false);

  const { location } = useAppNavigation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    userPropertiesRef.current = userProperties;
  }, [stringify(userProperties)]);

  useEffect(() => {
    if (user?.userId) (async () => await alterUserXP.getUserXp())();
  }, [user?.userId]);

  useEffect(() => {
    const editingAnnouncment = announcements.find(
      (anc) => anc.announcement_id === announcementId,
    );
    if (announcementId !== -1 && editingAnnouncment) {
      setAnnouncementTitle(editingAnnouncment.title);
      setAnnouncementMessage(editingAnnouncment.message);
    }
  }, [announcementId, announcements.length]);

  useEffect(() => {
    if (isOpen) return;
    // Clean up modal closing
    clearAllEditingForms();
    selectedIdsStore.clearSelected("boards");
    selectedIdsStore.clearSelected("properties");

    if (page === DashboardModalPages.CreateTeamBoardModal && !isOpen) {
      reloadUserBoards(user?.userId ?? -1);
      loadTeams();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [location.key]);

  useEffect(() => {
    if (teams.length > 0) {
      const team = teams[0];

      selectedIdStore.setId("teamId", team.team_id);
      onSelectTeam(team);
      setNewTeamName(team.team_name);
      teamProperties.current = (team.properties ?? []).map(
        APropertyToIProperty,
      );
      teamBoards.current = (team.boards ?? []).map(AKanbanBoardToIKanbanBoard);
    } else {
      // User was removed from team or team was deleted — clear the dashboard
      onSelectTeam(null);
      setNewTeamName("");
      teamProperties.current = [];
      teamBoards.current = [];
    }
  }, [stringify(teams)]);

  useTimeoutEffect(
    () => {
      if (!selectedTeam) return;

      updateTeamName();
    },
    [newTeamName],
    250,
  );

  useEffect(() => {
    setOpenAddTeamPropertiesButtons();
  }, [selectedIdsStore.properties.length]);

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

  const openCreateAnnouncmentModal = () => {
    setPage(DashboardModalPages.CreateAnnouncmentModal);
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

  const internalOpenViewPropertiesModal = (
    properties: IProperty[],
    onClick: (propertyId: number) => void = () => {},
    title?: string,
  ) => {
    viewPropertiesModalStore.setTitle(title);
    viewPropertiesModalStore.setProperties(properties);
    viewPropertiesModalStore.setOnClick(onClick);
  };

  const openViewPropertiesModal = () => {
    internalOpenViewPropertiesModal(
      userPropertiesRef.current,
      (propertyId) =>
        openEditPropertyModalFromType(
          propertyId,
          "custom",
          userPropertiesRef.current,
        ),
      "My Properties",
    );
    viewPropertiesModalStore.setSubmitButtons(undefined, undefined);
    setPage(DashboardModalPages.ViewPropertiesModal);
    toggleModalOpen(true);
  };

  const openViewTeamPropertiesModal = () => {
    internalOpenViewPropertiesModal(
      teamProperties.current,
      (propertyId) =>
        openEditPropertyModalFromType(
          propertyId,
          "custom",
          teamProperties.current,
        ),
      "Team Properties",
    );
    viewPropertiesModalStore.setSubmitButtons(undefined, undefined);
    setPage(DashboardModalPages.ViewPropertiesModal);
    toggleModalOpen(true);
  };

  const setOpenAddTeamPropertiesButtons = () => {
    const currentProperties = (selectedTeam?.properties ?? []).map(
      (prop) => prop.property_id,
    );

    const newProps = selectedIdsStore.properties.filter(
      (propId) => !currentProperties.includes(propId),
    );
    const removedProps = currentProperties.filter(
      (propId) => !selectedIdsStore.properties.includes(propId),
    );

    const isRemoving = removedProps.length > 0 && newProps.length === 0;
    const isUnchanged = newProps.length === 0 && removedProps.length === 0;

    viewPropertiesModalStore.setSubmitButtons(
      {
        text: isRemoving ? "Remove from Team" : "Add to Team",
        disabled: isUnchanged,
        icon: isRemoving ? Icons.Minus : Icons.Add,
        onClick: async () => {
          const linkedProperties = (
            await Promise.all(
              newProps.map(
                async (propertyId) => await linkPropertyToTeam(propertyId),
              ),
            )
          ).filter((prop) => prop);
          const unlinkedProperties = await Promise.all(
            removedProps.map(
              async (propertyId) => await unlinkPropertyFromTeam(propertyId),
            ),
          );
          if (linkedProperties.length > 0)
            successMsg(`Added ${linkedProperties.length} to team`);
          if (unlinkedProperties.length > 0)
            errorMsg(`Removed ${unlinkedProperties.length} from team`);
          toggleModalOpen();
          await loadTeams();
        },
      },
      undefined,
    );
  };

  const onAddTeamPropertyClick = () => {
    const userPropIds = userPropertiesRef.current.map(
      (prop) => prop.propertyId,
    );
    const nonUserPropertiesInTeamProperties = teamProperties.current.filter(
      (prop) => !userPropIds.includes(prop.propertyId),
    );

    internalOpenViewPropertiesModal(
      nonUserPropertiesInTeamProperties.concat(userPropertiesRef.current),
      (propertyId) => {
        if (isUserAdmin || userPropIds.includes(propertyId))
          selectedIdsStore.toggleSelected("properties", propertyId);
        else errorMsg("Only an admin can remove this property");
      },
      `Add Team Properties`,
    );
    setOpenAddTeamPropertiesButtons();
    teamProperties.current.forEach((property) =>
      selectedIdsStore.toggleSelected("properties", property.propertyId),
    );
    setPage(DashboardModalPages.AddTeamProperties);
    toggleModalOpen();
  };

  const openEditPropertyModalFromType = (
    propertyId: number,
    type: "team" | "user" | "custom" = "user",
    forceProperties?: IProperty[],
  ) => {
    const property = (
      forceProperties
        ? forceProperties
        : type === "team"
          ? teamProperties.current
          : userPropertiesRef.current
    ).find((prop) => prop.propertyId === propertyId);
    setEditingProperty(property);
    openCreatePropertyModal();
  };

  const openCreateBoardModal = () => {
    setPage(DashboardModalPages.CreateBoardModal);
    toggleModalOpen(true);
  };

  const onBoardClick = (boardId: number) => toBoardPage(boardId);

  const internalOpenViewBoardsModal = (
    boards: IKanbanBoard[],
    onClick: (boardId: number) => void = () => {},
    title: string = "View Boards",
  ) => {
    viewBoardsModalStore.setBoards(boards);
    viewBoardsModalStore.setOnClick(onClick);
    viewBoardsModalStore.setTitle(title);
  };

  const openViewBoardsModal =
    (boards: IKanbanBoard[], title: string = "View Boards") =>
    () => {
      internalOpenViewBoardsModal(
        boards,
        (boardId) => {
          viewBoardsModalStore.setBoards([]);
          toggleModalOpen(false);
          onBoardClick(boardId);
        },
        title,
      );

      setPage(DashboardModalPages.ViewBoardsModal);
      toggleModalOpen(true);
    };

  const onAddTeamBoardClick = () => {
    setPage(DashboardModalPages.CreateTeamBoardModal);
    toggleModalOpen(true);
  };

  const linkTeamBoard = async (boardId: number) => {
    if (!selectedTeam) return;
    const res = await api.linkTeamBoard(selectedTeam.team_id, boardId);
    if (res.err || !res.data)
      return (api.apiResponseError("linking team board", res.err), undefined);
    onSelectTeam(res.data);
    return res.data;
  };

  const unlinkTeamBoard = async (boardId: number) => {
    if (!selectedTeam) return;
    const res = await api.unlinkTeamBoard(selectedTeam.team_id, boardId);
    if (res.err || !res.data)
      return (api.apiResponseError("linking team board", res.err), undefined);
    onSelectTeam(res.data);
    return res.data;
  };

  const onEditAnnouncementClick = (announcementId: number) => {
    setKey("announcementId", announcementId);
    setPage(DashboardModalPages.CreateAnnouncmentModal);
    toggleModalOpen();
  };

  const onEditAnnouncementModalClose = () => {
    clearKey("announcementId");
  };

  const openViewAnnouncementsModal = () => {
    setPage(DashboardModalPages.ViewAnnouncementModal);
    toggleModalOpen();
  };

  const linkPropertyToTeam = async (propertyId: number) => {
    if (!selectedTeam) return undefined;
    const res = await api.linkTeamProperty(selectedTeam.team_id, propertyId);
    if (res.err || !res.data)
      return (
        api.apiResponseError("linking property to team", res.err),
        undefined
      );
    return propertyId;
  };

  const unlinkPropertyFromTeam = async (propertyId: number) => {
    if (!selectedTeam) return;
    const res = await api.unlinkTeamProperty(selectedTeam.team_id, propertyId);
    if (res.err || !res.data)
      return (
        api.apiResponseError("unlinking property from team", res.err),
        undefined
      );
    return propertyId;
  };

  const closeGlobalModal = async () => {
    if (globalModalStore.preClose) await globalModalStore.preClose();
    globalModalStore.toggleOpen();
    if (globalModalStore.postClose) await globalModalStore.postClose();
  };

  const onUserPropertyClick = (propertyId: number) => {
    const isPropertyInTeam = (selectedTeam?.properties ?? []).find(
      (prop) => prop.property_id === propertyId,
    );

    const onActionClick = async () => (
      await (isPropertyInTeam
        ? unlinkPropertyFromTeam(propertyId)
        : linkPropertyToTeam(propertyId)),
      await closeGlobalModal()
    );
    const setActionButton = (disabled: boolean) =>
      viewPropertyModalControlStore.setActionBtn("primaryBtn", {
        text: isPropertyInTeam ? "Remove from team" : "Add to team",
        disabled,
        icon: isPropertyInTeam ? Icons.Minus : Icons.Add,
        onClick: onActionClick,
      });

    selectedIdStore.setId("propertyId", propertyId);
    globalModalStore.setPage(GlobalModalPage.ViewProperty);
    viewPropertyModalControlStore.setTitle("View Property");
    viewPropertyModalControlStore.setIsClosed(false);

    viewPropertyModalControlStore.setOnEdit(() =>
      openEditPropertyModalFromType(propertyId, "user"),
    );
    setActionButton(false);

    globalModalStore.toggleOpen();

    globalModalStore.setListener("preClose", () => {
      selectedIdStore.clearId("propertyId");
      viewPropertyModalControlStore.setIsClosed(false);
      globalModalStore.clearListeners();
      viewPropertyModalControlStore.clearActionBtn("primaryBtn");
      viewPropertyModalControlStore.clearActionBtn("secondaryBtn");
    });
  };

  const onTeamPropertyClick = (propertyId: number) => {
    const isPropertyClosed =
      (selectedTeam?.deals ?? []).find(
        (deal) => deal.property_id === propertyId,
      ) !== undefined;

    const onMarkAsSold = async () => {
      setPrimaryActionBtn(true);

      await closeTeamProperty(propertyId);

      setPrimaryActionBtn(false);

      await closeGlobalModal();
    };
    const setPrimaryActionBtn = (disabled: boolean) =>
      viewPropertyModalControlStore.setActionBtn("primaryBtn", {
        text: "Mark as Sold",
        icon: Icons.Coin,
        disabled,
        onClick: onMarkAsSold,
      });

    selectedIdStore.setId("propertyId", propertyId);
    globalModalStore.setPage(GlobalModalPage.ViewProperty);
    viewPropertyModalControlStore.setTitle("View Team Property");

    viewPropertyModalControlStore.setOnEdit(() =>
      openEditPropertyModalFromType(propertyId, "team"),
    );

    viewPropertyModalControlStore.setIsClosed(isPropertyClosed);
    if (isPropertyClosed)
      viewPropertyModalControlStore.clearActionBtn("primaryBtn");
    else setPrimaryActionBtn(false);

    globalModalStore.toggleOpen();

    globalModalStore.setListener("preClose", () => {
      selectedIdStore.clearId("propertyId");
      viewPropertyModalControlStore.setIsClosed(false);
      globalModalStore.clearListeners();
      viewPropertyModalControlStore.clearActionBtn("primaryBtn");
      viewPropertyModalControlStore.clearActionBtn("secondaryBtn");
    });
  };

  const closeTeamProperty = async (propertyId: number) => {
    if (!user) return;

    await api.closeTeamDeal({
      teamId: selectedIdStore.teamId,
      propertyId,
      user_id: user.userId,
      closed_at: new Date().toISOString(),
      sale_price: 0,
      lead_id: selectedIdStore.leadId > 0 ? selectedIdStore.leadId : null,
      notes: "",
    });
  };

  return {
    newTeamName,
    setNewTeamName,
    inviteEmail,
    setInviteEmail,

    announcementMessage,
    announcementTitle,
    setAnnouncementMessage,
    setAnnouncementTitle,

    selectedTeam,
    user,
    leaderboardMembers,
    teamMembers,
    adminMembers,
    isUserAdmin,

    userProperties,
    userBoards,

    teamProperties,
    teamBoards,

    announcements,
    isEditingAnnouncements: announcementId !== -1,

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
    openCreateAnnouncmentModal,
    openViewAnnouncementsModal,
    onAddTeamPropertyClick,
    openViewTeamPropertiesModal,

    onCancelInvitation,
    onRemoveMember,
    onPromoteToAdmin,
    onDemoteFromAdmin,
    openEditPropertyModalFromType,
    onUserPropertyClick,
    onBoardClick,
    onCreateTeam,
    onPostAnnouncement:
      announcementId === -1 ? onPostAnnouncement : onUpdateAnnouncement,
    onTeamPropertyClick,

    onDeleteAnnouncement: isUserAdmin ? onDeleteAnnouncement : undefined,
    onEditAnnouncementClick: isUserAdmin ? onEditAnnouncementClick : undefined,
    onEditAnnouncementModalClose,
    onAddTeamBoardClick,
    linkTeamBoard,
    unlinkTeamBoard,

    displayOverflow: {
      invitations: invitationsDisplayOverflow,
      teamMembers: teamMembersDisplayOverflow,
      admin: adminDisplayOverflow,

      leaderboard: leaderboardDisplayOverflow,
      property: propertyDisplayOverflow,
      boards: boardsDisplayOverflow,
      announcements: announcementDisplayOverflow,
      teamProperties: teamPropertiesDisplayOverflow,
    },

    overflow: {
      invitations: invitationsOverflow,
      teamMembers: teamMembersOverflow,
      admin: adminOverflow,

      leaderboard: leaderboardOverflow,
      property: propertyOverflow,
      boards: boardsOverflow,
      announcements: announcementOverflow,
      teamProperties: teamPropertiesOverflow,
    },

    sliceCount: {
      invitations: invitationsSliceCount,
      teamMembers: teamMembersSliceCount,
      admin: adminSliceCount,

      leaderboard: leaderboardSliceCount,
      property: propertySliceCount,
      boards: boardsSliceCount,
      announcements: announcementSliceCount,
      teamProperties: teamPropertiesSliceCount,
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

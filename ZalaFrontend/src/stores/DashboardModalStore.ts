import { create } from "zustand";

export enum DashboardModalPages {
  InviteMemberModal = "InviteMemberModal",
  ViewMemberModal = "ViewMemberModal",
  LeaderboardModal = "LeaderboardModal",
  CreateProperty = "CreateProperty",
  ViewPropertiesModal = "ViewPropertiesModal",
  CreateBoardModal = "CreateBoardModal",
  CreateTeamBoardModal = "CreateTeamBoardModal",
  ViewBoardsModal = "ViewBoardsModal",
  CreateAnnouncmentModal = "CreateAnnouncmentModal",
  ViewAnnouncementModal = "ViewAnnouncementModal",
  AddTeamProperties = "AddTeamProperties",
}

type IDashboardModalStore = {
  page: DashboardModalPages;
  setPage: (page: DashboardModalPages) => void;

  isOpen: boolean;
  toggle: (val?: boolean) => void;
};

export const useDashboardModalStore = create<IDashboardModalStore>()(
  (set, get) => ({
    page: DashboardModalPages.InviteMemberModal,
    setPage: (page) => set({ page }),

    isOpen: false,
    toggle: (val) => set({ isOpen: val ?? !get().isOpen }),
  }),
);

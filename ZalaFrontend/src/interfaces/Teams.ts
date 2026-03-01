import type { AKanbanBoard } from "./BoardV2";
import type { AProperty } from "./Property";

export type ITeamBase = {
  team_id: number;
  team_name: string;
  created_at: string;
  created_by_user_id?: number;
  xp: number;
};

export type ITeamMemberWithXP = {
  user_id: number;
  username: string;
  xp: number;
  teamMember?: ITeamMember;
};

export type ITeamMember = {
  role: string;
  user: {
    user_id: number;
    username: string;
    profile_pic?: string;
    first_name?: string;
    last_name?: string;
  };
};

export type ITeam = ITeamBase & {
  members: ITeamMember[];
  properties: AProperty[];
  boards: AKanbanBoard[];
};

export type ITeamInvitation = {
  invitation_id: number;
  team_id: number;
  sender_id: number;
  recipient_id?: number;
  recipient_email: string;
  status: boolean | null; // null = pending, true = accepted, false = declined
  created_at: string;
  team?: ITeamBase;
};

export type ITeamAnnouncement = {
  announcement_id: number;
  team_id: number;
  author_id: number;
  title: string;
  message: string;
  author?: {
    user_id: number;
    username: string;
    profile_pic?: string;
    first_name?: string;
    last_name?: string;
  };
  created_at: string;
  updated_at?: string;
};

export type INotification = {
  notification_id: number;
  recipient_id: number;
  sender_id: number;
  type: string;
  message: string;
  viewed: boolean;
  created_at: string;
  invitation_id?: number;
  team_id?: number;
};

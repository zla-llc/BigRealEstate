export type Team = {
  team_id: number;
  team_name: string;
  created_at: string;
  created_by_user_id?: number;
  xp: number;
};

export type TeamMemberWithXP = {
  user_id: number;
  username: string;
  xp: number;
  teamMember?: TeamMember;
};

export type TeamMember = {
  role: string;
  user: {
    user_id: number;
    username: string;
    profile_pic?: string;
    first_name?: string;
    last_name?: string;
  };
};

export type TeamWithMembers = Team & {
  members: TeamMember[];
};

export type TeamInvitation = {
  invitation_id: number;
  team_id: number;
  sender_id: number;
  recipient_id?: number;
  recipient_email: string;
  status: boolean | null; // null = pending, true = accepted, false = declined
  created_at: string;
  team?: Team;
};

export type Notification = {
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

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum

from app.schemas.user import UserSummary
from app.schemas.team_invitation import TeamInvitationPublic
from app.schemas.property import PropertyPublic
from app.schemas.board import BoardPublic
from app.schemas.summaries import PropertySummary, BoardSummary


class TeamRole(str, Enum):
    ADMIN = "admin"
    MEMBER = "member"


class TeamSummary(BaseModel):
    """Lightweight summary of a Team for embedding in other resources."""
    team_id: int
    team_name: str
    xp: int

    class Config:
        from_attributes = True


class TeamBase(BaseModel):
    """Shared fields for Team schema variants"""
    team_name: str
    xp: int = 0


class TeamCreate(TeamBase):
    """Schema for creating a team"""
    pass


class TeamUpdate(BaseModel):
    """Schema for partial team updates"""
    team_name: Optional[str] = None
    xp: Optional[int] = None


class TeamMemberPublic(BaseModel):
    """Schema for Team User link """
    role: TeamRole = TeamRole.MEMBER
    user: UserSummary

    class Config:
        from_attributes = True


class TeamPublic(TeamBase):
    """Schema for Team incl. properties and boards"""
    team_id: int
    created_by_user_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    member_links: List[TeamMemberPublic] = Field(default=[], alias="members")

    # ^ json obj will show "members" but pydantic will pull "member_links" from user_teams

    # properties: List[PropertyPublic] = []
    # boards: List[BoardPublic] = []

    class Config:
        from_attributes = True
        populate_by_name = True


class TeamAdminsPublic(TeamBase):
    """Schema for returning ONLY admin users."""
    team_id: int
    # from the model property @admin_users
    admins: List[UserSummary] = Field(default=[], alias="admin_users")

    class Config:
        from_attributes = True


class TeamMembersOnlyPublic(TeamBase):
    """Schema for returning ONLY regular members."""
    team_id: int
    # from the model property @member_users
    members: List[UserSummary] = Field(default=[], alias="member_users")

    class Config:
        from_attributes = True


class TeamPublicWithProperties(TeamPublic):
    properties: List[PropertySummary] = []


class TeamPublicWithBoards(TeamPublic):
    boards: List[BoardSummary] = []


class TeamPublicWithPropertiesAndBoards(TeamPublic):
    properties: List[PropertySummary] = []
    boards: List[BoardSummary] = []


class TeamPublicWithInvitations(TeamPublic):
    """Schema for Team with invitations MEANT FOR ADMINS ONLY"""
    invitations: List[TeamInvitationPublic] = []


class TeamLeaderboardEntry(BaseModel):
    """Minimal data for leaderboard rows"""
    team_id: int
    team_name: str
    xp: int


class TeamUserXPEntry(BaseModel):
    """Minimal data for team users ranked by XP"""
    user_id: int
    username: str
    xp: int

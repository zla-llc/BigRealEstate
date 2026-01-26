from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

# Import the specific schemas we need
from app.schemas.user import UserSummary
from app.schemas.team_invitation import TeamInvitationPublic


class TeamRole(str, Enum):
    ADMIN = "admin"
    MEMBER = "member"


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
    """Schema for Team"""
    team_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    member_links: List[TeamMemberPublic] = Field(default=[], alias="members")
    # ^ json obj will show "members" but pydantic will pull "member_links" from user_teams
    invitations: List[TeamInvitationPublic] = []

    class Config:
        from_attributes = True,
        populate_by_name = True


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

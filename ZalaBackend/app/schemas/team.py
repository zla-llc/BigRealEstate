from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class TeamBase(BaseModel):
    """Shared fields for Team schema variants."""

    team_name: str
    admin_ids: List[int] = Field(..., min_length=1)
    member_ids: Optional[List[int]] = None
    property_ids: Optional[List[int]] = None
    board_ids: Optional[List[int]] = None
    xp: int = 0


class TeamCreate(TeamBase):
    """Schema for creating a team."""


class TeamUpdate(BaseModel):
    """Schema for partial team updates."""

    team_name: Optional[str] = None
    admin_ids: Optional[List[int]] = None
    member_ids: Optional[List[int]] = None
    property_ids: Optional[List[int]] = None
    board_ids: Optional[List[int]] = None
    xp: Optional[int] = None


class TeamPublic(TeamBase):
    """Schema returned from Team endpoints."""

    team_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TeamLeaderboardEntry(BaseModel):
    """Minimal data for leaderboard rows."""

    team_id: int
    team_name: str
    xp: int


class TeamUserXPEntry(BaseModel):
    """Minimal data for team users ranked by XP."""

    user_id: int
    username: str
    xp: int
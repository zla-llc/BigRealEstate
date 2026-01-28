from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Optional

# note for api dev: use /teams/{team_id}/invitations endpoint

class TeamInvitationBase(BaseModel):
    """Base schema"""
    recipient_email: EmailStr

class TeamInvitationCreate(TeamInvitationBase):
    """Schema sending invitation"""
    pass


class TeamInvitationUpdate(BaseModel):
    """Schema for accepting/declining an invitation"""
    status: bool  # True = Accepted, False = Declined


class TeamInvitationPublic(TeamInvitationBase):
    """Public schema"""
    invitation_id: int
    team_id: int
    team_name: Optional[str] = None
    status: Optional[bool] = None  # None = Pending, True = Accepted, False = Declined
    created_at: datetime

    class Config:
        from_attributes = True

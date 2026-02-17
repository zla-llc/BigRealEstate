from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.schemas.user import UserSummary


class AnnouncementBase(BaseModel):
    """Base schema for announcements."""
    title: str
    message: str


class AnnouncementCreate(AnnouncementBase):
    """Schema for creating an announcement."""
    pass


class AnnouncementUpdate(BaseModel):
    """Schema for updating an announcement."""
    title: Optional[str] = None
    message: Optional[str] = None


class AnnouncementPublic(AnnouncementBase):
    """Schema for returning announcement to client."""
    announcement_id: int
    team_id: int
    author_id: int
    author: Optional[UserSummary] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

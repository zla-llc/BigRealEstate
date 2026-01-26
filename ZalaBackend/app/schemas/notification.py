from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from app.schemas.user import UserSummary


class NotificationBase(BaseModel):
    """base schema"""
    type: Optional[str] = None
    title: Optional[str] = None
    message: Optional[str] = None


class NotificationUpdate(BaseModel):
    """Schema for marking notifications as read"""
    viewed: bool


class NotificationPublic(NotificationBase):
    """public schema"""
    notification_id: int
    viewed: bool
    recipient_id: int
    sender: Optional[UserSummary] = None
    created_at: datetime

    class Config:
        from_attributes = True

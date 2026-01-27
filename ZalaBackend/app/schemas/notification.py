from pydantic import BaseModel, ConfigDict, field_serializer
from datetime import datetime
from typing import Optional, TYPE_CHECKING, Any


class SenderSummary(BaseModel):
    """Lightweight sender info to avoid circular imports"""
    user_id: int
    username: Optional[str] = None
    
    class Config:
        from_attributes = True


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
    sender_id: Optional[int] = None
    invitation_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

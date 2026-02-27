from typing import Optional
from pydantic import BaseModel


class UserTutorialBase(BaseModel):
    """Base schema"""
    dashboard_step: Optional[int] = 0
    navbar_step: Optional[int] = 0
    map_step: Optional[int] = 0
    campaign_step: Optional[int] = 0
    board_step: Optional[int] = 0


class UserTutorialCreate(UserTutorialBase):
    """Schema for new user"""
    user_id: int


class UserTutorialUpdate(BaseModel):
    """Schema for updating steps."""
    dashboard_step: Optional[int] = None
    navbar_step: Optional[int] = None
    map_step: Optional[int] = None
    campaign_step: Optional[int] = None
    board_step: Optional[int] = None


class UserTutorialPublic(UserTutorialBase):
    """Public return schema"""
    tutorial_id: int
    user_id: int
    dashboard_step: int
    navbar_step: int
    map_step: int
    campaign_step: int
    board_step: int

    class Config:
        from_attributes = True

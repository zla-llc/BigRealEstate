from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class TeamDealBase(BaseModel):
    """base schema"""
    sale_price: Optional[float] = 0.0
    notes: Optional[str] = None


class TeamDealCreate(TeamDealBase):
    """create schema"""
    team_id: int
    user_id: int
    property_id: Optional[int] = None
    lead_id: Optional[int] = None
    xp_earned: Optional[int] = 0
    closed_at: Optional[datetime] = None


class TeamDealCreateRequest(TeamDealBase):
    """create request schema"""
    # team_id: int
    user_id: int
    # property_id: Optional[int] = None
    lead_id: Optional[int] = None
    xp_earned: Optional[int] = 0
    closed_at: Optional[datetime] = None


class TeamDealUpdate(BaseModel):
    """update schema"""
    property_id: Optional[int] = None
    lead_id: Optional[int] = None
    sale_price: Optional[float] = None
    xp_earned: Optional[int] = None
    notes: Optional[str] = None


class UserDealXPPublic(BaseModel):
    """total xp of user"""
    user_id: int
    total_xp: int


class TeamDealPublic(TeamDealBase):
    """public schema"""
    deal_id: int
    team_id: int
    user_id: int
    property_id: Optional[int]
    lead_id: Optional[int]
    xp_earned: int
    closed_at: datetime
    notes: Optional[str]

    class Config:
        from_attributes = True

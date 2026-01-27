from pydantic import BaseModel, EmailStr, Field, model_validator
from datetime import datetime
from typing import Optional, List, Any

from app.models.contact import Contact
from app.schemas.contact import ContactPublic, ContactBase, ContactCreate
from app.schemas.summaries import LeadSummary
from app.schemas.notification import NotificationPublic
from app.schemas.team_invitation import TeamInvitationPublic


class UserSummary(BaseModel):
    """Lightweight summary of a User for embedding in other resources."""
    user_id: int
    username: str
    profile_pic: Optional[str] = None
    role: Optional[str] = "user"
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    class Config:
        from_attributes = True
    
    @model_validator(mode='before')
    @classmethod
    def extract_contact_info(cls, data: Any) -> Any:
        """Extract first_name and last_name from the nested contact relationship."""
        if hasattr(data, 'contact') and data.contact:
            # SQLAlchemy model with contact relationship
            return {
                'user_id': data.user_id,
                'username': data.username,
                'profile_pic': data.profile_pic,
                'role': data.role,
                'first_name': data.contact.first_name if data.contact else None,
                'last_name': data.contact.last_name if data.contact else None,
            }
        return data


class UserBase(BaseModel):
    """
    Base Schema for User
    """
    username: str = Field(max_length=15)
    profile_pic: Optional[str]
    role: Optional[str] = "user"


class UserCreate(UserBase):
    """
    Schema for POST user (create)
    """
    # Contact should not be created or attached when creating a user.
    # Linking a contact to a user must be done with the link endpoint
    # POST /users/{user_id}/contacts/{contact_id}
    password: str


class UserSignup(UserCreate):
    """
    Schema for signing up a user with a new contact record.
    """
    contact: ContactCreate


class UserUpdate(BaseModel):
    """
    Schema for update a User
    """
    password: Optional[str]
    username: Optional[str] = Field(max_length=15)
    profile_pic: Optional[str]
    role: Optional[str] = "user"


class UserPublic(UserBase):
    """
    Schema for GET user (read/return)
    """
    user_id: int
    # Contact is optional — users may not have a linked contact
    contact: Optional[ContactPublic] = None
    xp: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    gmail_connected: bool = False

    class Config:
        from_attributes = True


class UserPublicWithProperties(UserPublic):
    """
    Schema for Get a user with their properties
    """
    # return property ids to avoid circular schema imports
    properties: List[int] = []


class UserPublicWithLeads(UserPublic):
    """
    Schema for Get a user with their leads
    """
    leads_created: List[LeadSummary] = []


class UserPublicWithLeadsAndProperties(UserPublic):
    """
    Schema for Get a user with their leads and properties
    """
    leads_created: List[LeadSummary] = []
    properties: List[int] = []


class UserPublicWithNotifications(UserPublic):
    notifications_received: List[NotificationPublic] = Field(default=[], alias="notifications_received")
    notifications_sent: List[NotificationPublic] = Field(default=[], alias="notifications_sent")


class UserPublicWithInvitations(UserPublic):
    invitations_received: List[TeamInvitationPublic] = Field(default=[], alias="invitations_received")
    invitations_sent: List[TeamInvitationPublic] = Field(default=[], alias="invitations_sent")

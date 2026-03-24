from typing import Optional, List, TYPE_CHECKING

from pydantic import BaseModel, Field

from app.schemas.unit import UnitPublic
from app.schemas.address import AddressPublic
from app.schemas.summaries import UserSummary
from app.schemas.property_image import PropertyImagePublic

if TYPE_CHECKING:
    from app.schemas.team import TeamSummary


class PropertyBase(BaseModel):
    """
    Base Schema for Property
    """
    property_name: str
    mls_number: Optional[str] = None
    notes: Optional[str] = None
    image_url: Optional[str] = None


class PropertyCreate(PropertyBase):
    """
    Schema for Create Property
    """
    # Optional server-derived creator id. Prefer deriving from auth rather than trusting client.
    creator_id: Optional[int] = None


class PropertyUpdate(BaseModel):
    """
    Schema for Update a property
    """
    property_name: Optional[str]
    lead_id: Optional[int] = None
    mls_number: Optional[str] = None
    notes: Optional[str] = None
    image_url: Optional[str] = None

class PropertyPublic(PropertyBase):
    """
    Schema for Get Property
    """
    property_id: int
    address_id: Optional[int] = None
    # include nested address details when reading a property
    address: Optional[AddressPublic] = None
    units: List[UnitPublic] = []
    images: List[PropertyImagePublic] = Field(default_factory=list)
    team: Optional["TeamSummary"] = None

    class Config:
        from_attributes = True

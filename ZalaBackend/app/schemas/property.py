from typing import Optional, List

from pydantic import BaseModel, Field

from app.schemas.unit import UnitPublic
from app.schemas.address import AddressPublic
from app.schemas.summaries import UserSummary
from app.schemas.property_image import PropertyImagePublic


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
    # Address is provided in the path (server-authoritative); no address_id required in body
    # lead_id: Optional[int] = None


class PropertyUpdate(BaseModel):
    """
    Schema for Update a property
    """
    # address association is managed by the path; updates won't change address_id
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

    class Config:
        from_attributes = True

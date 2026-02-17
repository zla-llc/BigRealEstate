from typing import Optional, Self
from pydantic import BaseModel, Field, EmailStr, field_validator, model_validator


class ContactBase(BaseModel):
    """
    Shared fields for Contact
    """
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=20)

class ContactCreate(ContactBase):
    """
    Schema for creating a new Contact
    """
    @model_validator(mode='after')
    def check_contact_method(self) -> Self:
        if not self.email and not self.phone:
            raise ValueError('Either email or phone must be provided.')
        return self
    @field_validator('email', mode='before')
    def check_email(cls, v):
        if isinstance(v, str) and v.strip() == "":
            return None
        return v

class ContactUpdate(ContactBase):
    """
    Schema for updating an existing Contact
    """
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=20)

class ContactPublic(ContactBase):
    """
    Schema for returning a Contact to the client
    """
    contact_id: int

    class Config:
        from_attributes = True

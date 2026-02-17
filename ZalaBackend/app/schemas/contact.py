from typing import Optional
from pydantic import BaseModel, Field, EmailStr, model_validator, field_validator


class ContactBase(BaseModel):
    """
    Shared fields for Contact
    """
    first_name: str
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=20)

    @field_validator("email", mode="before")
    @classmethod
    def empty_email_to_none(cls, v):
        if v == "":
            return None
        return v

    @field_validator("phone", mode="before")
    @classmethod
    def empty_phone_to_none(cls, v):
        if v == "":
            return None
        return v


class ContactCreate(ContactBase):
    """
    Schema for creating a new Contact
    """

    @model_validator(mode="after")
    def check_email_or_phone(self):
        if not self.email and not self.phone:
            raise ValueError("At least one of email or phone must be provided.")
        return self


class ContactUpdate(ContactBase):
    """
    Schema for updating an existing Contact
    """

    first_name: Optional[str]
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=20)

    @model_validator(mode="after")
    def check_email_or_phone(self):
        if not self.email and not self.phone:
            raise ValueError("At least one of email or phone must be provided.")
        return self


class ContactPublic(ContactBase):
    """
    Schema for returning a Contact to the client
    """
    contact_id: int

    class Config:
        from_attributes = True

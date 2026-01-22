from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class LeadImagePublic(BaseModel):
    lead_image_id: int
    image_url: str
    caption: Optional[str] = None
    sort_order: int
    created_at: datetime

    class Config:
        from_attributes = True

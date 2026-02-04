from datetime import datetime
from typing import Optional

from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base


class LeadImage(Base):
    __tablename__ = "lead_images"

    lead_image_id: Mapped[int] = mapped_column(primary_key=True)
    lead_id: Mapped[int] = mapped_column(ForeignKey("leads.lead_id", ondelete="CASCADE"), nullable=False)
    image_url: Mapped[str] = mapped_column(nullable=False)
    caption: Mapped[Optional[str]] = mapped_column(nullable=True)
    sort_order: Mapped[int] = mapped_column(nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())

    lead: Mapped["Lead"] = relationship("Lead", back_populates="images")

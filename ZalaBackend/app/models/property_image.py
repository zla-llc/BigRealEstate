from datetime import datetime
from typing import Optional

from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base


class PropertyImage(Base):
    __tablename__ = "property_images"

    property_image_id: Mapped[int] = mapped_column(primary_key=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.property_id", ondelete="CASCADE"), nullable=False)
    image_url: Mapped[str] = mapped_column(nullable=False)
    caption: Mapped[Optional[str]] = mapped_column(nullable=True)
    sort_order: Mapped[int] = mapped_column(nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())

    property: Mapped["Property"] = relationship("Property", back_populates="images")

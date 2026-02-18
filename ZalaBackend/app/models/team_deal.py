from datetime import datetime
from typing import Optional

from sqlalchemy import ForeignKey, Integer, Float, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base


class TeamDeal(Base):
    __tablename__ = "team_deals"

    deal_id: Mapped[int] = mapped_column(primary_key=True)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.team_id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    property_id: Mapped[Optional[int]] = mapped_column(ForeignKey("properties.property_id"), nullable=True)
    lead_id: Mapped[Optional[int]] = mapped_column(ForeignKey("leads.lead_id"), nullable=True)
    sale_price: Mapped[Optional[float]] = mapped_column(nullable=True, default=0.0)
    closed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    xp_earned: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    notes: Mapped[Optional[str]] = mapped_column(nullable=True, default=0.0)

    team: Mapped["Team"] = relationship("Team", back_populates="deals")
    user: Mapped["User"] = relationship("User", back_populates="deals")
    property: Mapped["Property"] = relationship("Property", back_populates="deal", uselist=False)
    lead: Mapped["Lead"] = relationship("Lead", back_populates="deals", uselist=False)

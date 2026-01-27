from datetime import datetime
from typing import Optional
from sqlalchemy import String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from ..db.session import Base


class Notification(Base):
    __tablename__ = "notifications"

    notification_id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    viewed: Mapped[bool] = mapped_column(Boolean, default=False)
    invitation_id: Mapped[Optional[int]] = mapped_column(ForeignKey("team_invitations.invitation_id"), nullable=True)
    recipient_id: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"))
    sender_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)  # None = system
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    recipient: Mapped["User"] = relationship(
        "User",
        foreign_keys=[recipient_id],
        back_populates="notifications_received"
    )
    sender: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[sender_id],
        back_populates="notifications_sent"
    )
    team_invitation: Mapped["TeamInvitation"] = relationship(
        "TeamInvitation",
        back_populates="notification",
        uselist=False
    )

from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base


class UserTutorial(Base):
    """
    SQLAlchemy model for tracking user tutorial progress
    """
    __tablename__ = "user_tutorials"

    tutorial_id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)

    dashboard_step: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    navbar_step: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    map_step: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    campaign_step: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    board_step: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    user: Mapped["User"] = relationship("User", back_populates="tutorial", uselist=False)

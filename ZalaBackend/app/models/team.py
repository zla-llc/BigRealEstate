from datetime import datetime
from typing import List

from sqlalchemy import Integer, String, text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from ..db.session import Base

EMPTY_INT_ARRAY = text("ARRAY[]::INTEGER[]")


class Team(Base):
    """SQLAlchemy model backing the teams table."""

    __tablename__ = "teams"

    team_id: Mapped[int] = mapped_column(primary_key=True)
    team_name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    admin_ids: Mapped[List[int]] = mapped_column(
        ARRAY(Integer), nullable=False, server_default=EMPTY_INT_ARRAY, default=list
    )
    member_ids: Mapped[List[int]] = mapped_column(
        ARRAY(Integer), nullable=False, server_default=EMPTY_INT_ARRAY, default=list
    )
    property_ids: Mapped[List[int]] = mapped_column(
        ARRAY(Integer), nullable=False, server_default=EMPTY_INT_ARRAY, default=list
    )
    board_ids: Mapped[List[int]] = mapped_column(
        ARRAY(Integer), nullable=False, server_default=EMPTY_INT_ARRAY, default=list
    )
    xp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(onupdate=func.now(), nullable=True)

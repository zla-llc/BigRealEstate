from datetime import datetime

from sqlalchemy import String, func, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from ..db.session import Base


class EmailVerificationCode(Base):
    """
    Stores 6-digit verification codes sent to emails during signup.
    Codes expire after 10 minutes.
    """
    __tablename__ = "email_verification_codes"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(6), nullable=False)
    verified: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

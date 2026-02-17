"""
CRUD helpers for email verification codes.
"""
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.email_verification import EmailVerificationCode


def create_verification_code(db: Session, email: str) -> str:
    """
    Generate a 6-digit code, persist it, and return the code string.
    Any previous un-verified codes for the same email are deleted first.
    """
    # Remove old codes for this email
    db.query(EmailVerificationCode).filter(
        EmailVerificationCode.email == email.lower(),
        EmailVerificationCode.verified == False,  # noqa: E712
    ).delete()

    code = f"{secrets.randbelow(1_000_000):06d}"
    record = EmailVerificationCode(
        email=email.lower(),
        code=code,
        verified=False,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
    )
    db.add(record)
    db.commit()
    return code


def verify_code(db: Session, email: str, code: str) -> bool:
    """
    Check the code. If valid and not expired, mark as verified and return True.
    """
    now = datetime.now(timezone.utc)
    record = (
        db.query(EmailVerificationCode)
        .filter(
            EmailVerificationCode.email == email.lower(),
            EmailVerificationCode.code == code,
            EmailVerificationCode.verified == False,  # noqa: E712
            EmailVerificationCode.expires_at > now,
        )
        .order_by(EmailVerificationCode.created_at.desc())
        .first()
    )
    if not record:
        return False

    record.verified = True
    db.commit()
    return True


def is_email_verified(db: Session, email: str) -> bool:
    """
    Return True if there's a verified code for this email (created within the last hour).
    This lets the signup endpoint gate on verification status.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(hours=1)
    record = (
        db.query(EmailVerificationCode)
        .filter(
            EmailVerificationCode.email == email.lower(),
            EmailVerificationCode.verified == True,  # noqa: E712
            EmailVerificationCode.created_at > cutoff,
        )
        .first()
    )
    return record is not None

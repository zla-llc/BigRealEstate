"""
Routes for email verification during signup.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.crud import email_verification as ev_crud
from app.schemas.email_verification import (
    SendVerificationCodeRequest,
    SendVerificationCodeResponse,
    VerifyCodeRequest,
    VerifyCodeResponse,
)
from app.utils.email_service import send_verification_email

router = APIRouter(
    prefix="/verify",
    tags=["Email Verification"],
)


@router.post(
    "/send-code",
    response_model=SendVerificationCodeResponse,
    status_code=status.HTTP_200_OK,
)
def send_code(body: SendVerificationCodeRequest, db: Session = Depends(get_db)):
    """
    Generate a 6-digit code and email it to the user.
    Called from the signup page before the user account is created.
    """
    code = ev_crud.create_verification_code(db, body.email)
    sent = send_verification_email(body.email, code)

    if not sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email. Please try again later.",
        )

    return SendVerificationCodeResponse(
        message="Verification code sent.",
        email=body.email,
    )


@router.post(
    "/confirm-code",
    response_model=VerifyCodeResponse,
    status_code=status.HTTP_200_OK,
)
def confirm_code(body: VerifyCodeRequest, db: Session = Depends(get_db)):
    """
    Verify the 6-digit code the user received.
    """
    ok = ev_crud.verify_code(db, body.email, body.code)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code.",
        )
    return VerifyCodeResponse(verified=True, message="Email verified successfully.")

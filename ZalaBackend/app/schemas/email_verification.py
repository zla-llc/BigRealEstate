from pydantic import BaseModel, EmailStr


class SendVerificationCodeRequest(BaseModel):
    """Request to send a 6-digit verification code to an email."""
    email: EmailStr


class SendVerificationCodeResponse(BaseModel):
    """Response after sending a verification code."""
    message: str
    email: str


class VerifyCodeRequest(BaseModel):
    """Request to verify a 6-digit code."""
    email: EmailStr
    code: str


class VerifyCodeResponse(BaseModel):
    """Response after verifying a code."""
    verified: bool
    message: str

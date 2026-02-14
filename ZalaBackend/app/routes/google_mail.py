from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.crud import user as user_crud
from app.db.crud import google_credentials as google_credentials_crud
from app.schemas import GmailSendRequest, GmailSendResponse, GmailSignatureResponse
from app.services.gmail import send_gmail_message, fetch_gmail_signature, _build_from_header, _resolve_access_token

router = APIRouter(prefix="/google-mail", tags=["Google Mail"])


@router.post("/send", response_model=GmailSendResponse, status_code=status.HTTP_200_OK)
def send_gmail(body: GmailSendRequest, db: Session = Depends(get_db)):
    user = user_crud.get_user_by_id(db, body.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    return send_gmail_message(db, user, body)


@router.get("/signature/{user_id}", response_model=GmailSignatureResponse, status_code=status.HTTP_200_OK)
def get_gmail_signature(user_id: int, db: Session = Depends(get_db)):
    """
    Fetch the Gmail signature for a user's connected Google account.
    """
    user = user_crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    credentials = google_credentials_crud.get_credentials(db, user_id)
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account is not connected.",
        )

    access_token = _resolve_access_token(db, credentials)
    sender_email, _ = _build_from_header(user, None)

    signature = fetch_gmail_signature(access_token, sender_email)
    if signature is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No Gmail signature found for this account.",
        )

    return GmailSignatureResponse(signature=signature, send_as_email=sender_email)

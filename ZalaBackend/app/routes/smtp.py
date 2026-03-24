"""
SMTP Email routes for sending emails.
Uses SMTP configuration from environment variables.
"""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from app.utils.email_signature import get_signature_html, attach_signature_logo

router = APIRouter(prefix="/smtp", tags=["SMTP"])


class SendEmailRequest(BaseModel):
    """Request model for sending an email."""
    to_email: EmailStr
    name: str  # Recipient's name for "Hi [name],"
    subject: str
    body: str


class SendEmailResponse(BaseModel):
    """Response model for send email."""
    success: bool
    message: str


def get_smtp_config() -> dict:
    """Get SMTP configuration from environment variables."""
    return {
        "host": os.getenv("SMTP_HOST", ""),
        "port": int(os.getenv("SMTP_PORT", "587")),
        "username": os.getenv("SMTP_USERNAME", ""),
        "password": os.getenv("SMTP_PASSWORD", ""),
        "use_tls": os.getenv("SMTP_USE_TLS", "true").lower() == "true",
        "from_email": os.getenv("SMTP_FROM_EMAIL", ""),
        "from_name": os.getenv("SMTP_FROM_NAME", "ZLA CRM"),
    }


@router.get("/config")
async def get_smtp_status():
    """Check if SMTP is configured. Returns status (not credentials)."""
    config = get_smtp_config()
    return {
        "configured": bool(config["host"] and config["username"] and config["password"]),
        "host": config["host"] if config["host"] else None,
        "port": config["port"],
    }


@router.post("/send", response_model=SendEmailResponse)
async def send_email(request: SendEmailRequest):
    """
    Send an email via SMTP.
    
    API Request Body:
    - to_email: recipient email address
    - name: recipient name (used in "Hi [name],")
    - subject: email subject
    - body: email body content
    
    SMTP settings come from .env:
    - SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD
    - SMTP_FROM_EMAIL, SMTP_FROM_NAME
    """
    config = get_smtp_config()
    
    # Validate SMTP is configured
    if not config["host"] or not config["username"] or not config["password"]:
        raise HTTPException(
            status_code=500,
            detail="SMTP not configured. Set SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD in .env"
        )
    
    from_email = config["from_email"] or config["username"]
    from_name = config["from_name"]
    
    # Create email with "Hi [name]," greeting
    full_body = f"Hi {request.name},\n\n{request.body}"
    
    # Create the email message
    msg = MIMEMultipart("alternative")
    msg["Subject"] = request.subject
    msg["From"] = f"{from_name} <{from_email}>"
    msg["To"] = request.to_email
    
    # Plain text version
    text_content = full_body
    
    # Build signature
    signature_html = get_signature_html()

    # HTML version
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <p style="color: #333; font-size: 16px;">Hi {request.name},</p>
          <p style="color: #333; line-height: 1.6;">{request.body}</p>
          {signature_html}
        </div>
      </body>
    </html>
    """

    # Use "related" subtype so the CID-referenced logo renders inline
    msg_related = MIMEMultipart("related")
    msg_related.attach(MIMEText(html_content, "html"))
    attach_signature_logo(msg_related)

    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(msg_related)
    
    try:
        # Connect and send
        server = smtplib.SMTP(config["host"], config["port"], timeout=30)
        if config["use_tls"]:
            server.starttls()
        
        server.login(config["username"], config["password"])
        server.sendmail(from_email, [request.to_email], msg.as_string())
        server.quit()
        
        return SendEmailResponse(
            success=True,
            message=f"Email sent to {request.to_email}"
        )
        
    except smtplib.SMTPAuthenticationError:
        raise HTTPException(status_code=401, detail="SMTP authentication failed. Check username/password.")
    except smtplib.SMTPConnectError:
        raise HTTPException(status_code=502, detail="Failed to connect to SMTP server.")
    except smtplib.SMTPException as e:
        raise HTTPException(status_code=500, detail=f"SMTP error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

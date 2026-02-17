"""
Lightweight email service using Python's built-in smtplib.

Required environment variables:
    SMTP_HOST      – SMTP server (e.g. smtp.gmail.com)
    SMTP_PORT      – SMTP port  (587 for TLS, 465 for SSL)
    SMTP_USER      – login email
    SMTP_PASSWORD  – app-specific password (NOT your regular password)
    SMTP_FROM      – "From" address shown to recipient (defaults to SMTP_USER)

For Gmail:
  1. Enable 2-Step Verification on your Google account
  2. Create an App Password at https://myaccount.google.com/apppasswords
  3. Use the 16-char app password as SMTP_PASSWORD
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def _get_smtp_config():
    host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER") or os.getenv("SMTP_USERNAME", "")
    password = os.getenv("SMTP_PASSWORD", "")
    from_addr = os.getenv("SMTP_FROM") or os.getenv("SMTP_FROM_EMAIL", user)
    return host, port, user, password, from_addr


def send_verification_email(to_email: str, code: str) -> bool:
    """
    Send a 6-digit verification code to the given email address.
    Returns True on success, False on failure.
    """
    host, port, user, password, from_addr = _get_smtp_config()

    if not user or not password:
        print("[EMAIL SERVICE] SMTP_USER or SMTP_PASSWORD not set – skipping email send")
        return False

    subject = "Zala CRM – Verify Your Email"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px;">
        <h2 style="color: #333;">Verify your email</h2>
        <p>Your verification code is:</p>
        <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            text-align: center;
            padding: 16px;
            background: #f4f4f4;
            border-radius: 8px;
            margin: 16px 0;
        ">{code}</div>
        <p style="color: #666; font-size: 14px;">
            This code expires in 10 minutes. If you didn't request this, you can ignore this email.
        </p>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Zala CRM <{from_addr}>"
    msg["To"] = to_email
    msg.attach(MIMEText(f"Your Zala CRM verification code is: {code}", "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        if port == 465:
            with smtplib.SMTP_SSL(host, port) as server:
                server.login(user, password)
                server.sendmail(from_addr, to_email, msg.as_string())
        else:
            with smtplib.SMTP(host, port) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(user, password)
                server.sendmail(from_addr, to_email, msg.as_string())
        return True
    except Exception as exc:
        print(f"[EMAIL SERVICE] Failed to send email to {to_email}: {exc}")
        return False

from __future__ import annotations

import base64
from datetime import datetime, timedelta, timezone
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
import hashlib
import logging
import re
from typing import Optional
from urllib.parse import urlparse

import requests
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.crud import google_credentials as google_credentials_crud
from app.models.user import User
from app.schemas import GmailSendRequest, GmailSendResponse
from app.utils.encryption import EncryptionError, decrypt_secret
from app.utils.google_oauth import GoogleOAuthExchangeError, refresh_access_token

logger = logging.getLogger(__name__)

_GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"
_GMAIL_SETTINGS_URL = "https://gmail.googleapis.com/gmail/v1/users/me/settings/sendAs"

# Regex to find <img src="..."> URLs in HTML
_IMG_SRC_RE = re.compile(r'(<img\b[^>]*?\bsrc\s*=\s*["\'])([^"\']+)(["\'])', re.IGNORECASE)


def fetch_gmail_signature(access_token: str, send_as_email: str) -> Optional[str]:
    """Fetch the Gmail signature for a specific sendAs address."""
    headers = {"Authorization": f"Bearer {access_token}"}
    try:
        response = requests.get(
            f"{_GMAIL_SETTINGS_URL}/{send_as_email}",
            headers=headers,
            timeout=10,
        )
        response.raise_for_status()
    except requests.RequestException:
        return None

    data = response.json()
    return data.get("signature") or None


def _build_from_header(user: User, from_name: Optional[str]) -> tuple[str, str]:
    email = None
    if user.authentication and user.authentication.provider_email:
        email = user.authentication.provider_email
    elif user.contact and user.contact.email:
        email = user.contact.email

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is missing an email address for Gmail.",
        )

    if from_name:
        display_name = from_name
    elif user.contact:
        parts = [user.contact.first_name or "", user.contact.last_name or ""]
        display_name = " ".join(part for part in parts if part).strip() or user.username
    else:
        display_name = user.username

    return email, formataddr((display_name, email))


# Domains where we should forward the user's OAuth token for image downloads
_GOOGLE_IMAGE_HOSTS = (
    "lh3.googleusercontent.com",
    "lh4.googleusercontent.com",
    "lh5.googleusercontent.com",
    "lh6.googleusercontent.com",
    "ci3.googleusercontent.com",
    "ci4.googleusercontent.com",
    "ci5.googleusercontent.com",
    "ci6.googleusercontent.com",
    ".googleusercontent.com",
    "drive.google.com",
    "docs.google.com",
)


def _is_google_hosted(url: str) -> bool:
    """Return True if the URL is hosted on a Google domain that may need auth."""
    try:
        host = urlparse(url).hostname or ""
        return any(host == h or host.endswith(h) for h in _GOOGLE_IMAGE_HOSTS)
    except Exception:
        return False


def _download_image(url: str, access_token: str | None = None) -> tuple[bytes, str] | None:
    """Download an image and return (data, content_type), or None on failure."""
    headers: dict[str, str] = {}
    is_google = _is_google_hosted(url)
    if access_token and is_google:
        headers["Authorization"] = f"Bearer {access_token}"
    logger.info("Downloading image: %s (google_hosted=%s, using_auth=%s)", url, is_google, bool(headers.get("Authorization")))
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        logger.info("Image download response: status=%s, content-type=%s, size=%d", resp.status_code, resp.headers.get("content-type", "?"), len(resp.content))
        if resp.status_code == 200 and resp.headers.get("content-type", "").startswith("image"):
            return resp.content, resp.headers["content-type"]
        # If unauthenticated attempt failed on a Google URL, retry with token
        if access_token and not headers.get("Authorization") and resp.status_code in (401, 403):
            logger.info("Retrying image download with auth token")
            resp = requests.get(
                url,
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=10,
            )
            logger.info("Retry response: status=%s, content-type=%s, size=%d", resp.status_code, resp.headers.get("content-type", "?"), len(resp.content))
            if resp.status_code == 200 and resp.headers.get("content-type", "").startswith("image"):
                return resp.content, resp.headers["content-type"]
    except Exception as exc:
        logger.warning("Could not download image %s: %s", url, exc)
    return None


def _embed_images(html: str, access_token: str | None = None) -> tuple[str, list[MIMEImage]]:
    """
    Find all <img src="..."> in the HTML, download remote images or decode
    data-URI images, replace the src with a cid: reference, and return the
    updated HTML plus a list of MIMEImage attachments.
    """
    inline_images: list[MIMEImage] = []
    seen: dict[str, str] = {}  # url-or-hash -> cid

    def _replace(match: re.Match) -> str:
        prefix, url, suffix = match.group(1), match.group(2), match.group(3)

        # Already a CID reference — leave it alone
        if url.startswith("cid:"):
            return match.group(0)

        # Handle data: URIs — convert them to CID inline attachments so
        # email clients that block data: URIs still display the image.
        if url.startswith("data:"):
            if url in seen:
                return f"{prefix}cid:{seen[url]}{suffix}"
            try:
                # data:[<mediatype>];base64,<data>
                header, b64_data = url.split(",", 1)
                mime = header.split(":")[1].split(";")[0]  # e.g. "image/png"
                img_data = base64.b64decode(b64_data)
                cid = hashlib.md5(img_data[:256]).hexdigest()
                seen[url] = cid
                subtype = mime.split("/")[-1]
                img_part = MIMEImage(img_data, _subtype=subtype)
                img_part.add_header("Content-ID", f"<{cid}>")
                img_part.add_header("Content-Disposition", "inline", filename=f"image.{subtype}")
                inline_images.append(img_part)
                return f"{prefix}cid:{cid}{suffix}"
            except Exception as exc:
                logger.debug("Could not decode data URI: %s", exc)
                return match.group(0)

        # Skip non-http URLs
        if not url.startswith("http://") and not url.startswith("https://"):
            return match.group(0)

        # Deduplicate: reuse cid if we already embedded this URL
        if url in seen:
            return f"{prefix}cid:{seen[url]}{suffix}"

        result = _download_image(url, access_token)
        if result is None:
            return match.group(0)  # keep original URL as fallback

        img_data, content_type = result
        # Build a unique content-id from the URL hash
        cid = hashlib.md5(url.encode()).hexdigest()
        seen[url] = cid

        # Determine subtype (e.g. "png" from "image/png")
        subtype = content_type.split("/")[-1].split(";")[0]
        img_part = MIMEImage(img_data, _subtype=subtype)
        img_part.add_header("Content-ID", f"<{cid}>")
        img_part.add_header("Content-Disposition", "inline", filename=f"image.{subtype}")
        inline_images.append(img_part)

        return f"{prefix}cid:{cid}{suffix}"

    updated_html = _IMG_SRC_RE.sub(_replace, html)
    return updated_html, inline_images


def _encode_message(from_header: str, to_email: str, subject: str, html: str, access_token: str | None = None) -> str:
    """
    Build a RFC 2822 message.
    If the HTML contains downloadable images, they are embedded as inline
    attachments in a multipart/related message so signature logos etc. display.
    """
    updated_html, inline_images = _embed_images(html, access_token)

    if inline_images:
        # multipart/related so inline CID images resolve
        msg = MIMEMultipart("related")
        msg.attach(MIMEText(updated_html, "html", "utf-8"))
        for img in inline_images:
            msg.attach(img)
    else:
        msg = MIMEText(updated_html, "html", "utf-8")

    msg["From"] = from_header
    msg["To"] = to_email
    msg["Subject"] = subject

    return base64.urlsafe_b64encode(msg.as_bytes()).decode("utf-8").rstrip("=")


def _inline_images_as_data_uris(html: str, access_token: str | None = None) -> str:
    """
    Download every <img src="https://..."> in the HTML and replace
    the src with a base64 data: URI so the image renders in any context
    (browser preview, email client, etc.) without external requests.
    """
    seen: dict[str, str] = {}  # url -> data URI

    def _replace(match: re.Match) -> str:
        prefix, url, suffix = match.group(1), match.group(2), match.group(3)

        if url.startswith("data:") or url.startswith("cid:"):
            return match.group(0)
        if not url.startswith("http://") and not url.startswith("https://"):
            return match.group(0)

        if url in seen:
            return f"{prefix}{seen[url]}{suffix}"

        result = _download_image(url, access_token)
        if result is None:
            return match.group(0)

        img_data, content_type = result
        b64 = base64.b64encode(img_data).decode("utf-8")
        # Normalise content-type (strip params like charset)
        mime = content_type.split(";")[0].strip()
        data_uri = f"data:{mime};base64,{b64}"
        seen[url] = data_uri
        return f"{prefix}{data_uri}{suffix}"

    return _IMG_SRC_RE.sub(_replace, html)


def fetch_gmail_signature(access_token: str, email: str) -> Optional[str]:
    """
    Fetch the Gmail signature for a specific send-as email address.
    Returns the HTML signature string with images converted to inline
    base64 data URIs, or None if not set / on error.
    """
    url = f"{_GMAIL_SETTINGS_URL}/{email}"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            sig = data.get("signature", "")
            if not sig:
                logger.info("Gmail signature is empty for %s", email)
                return None
            logger.info("Gmail raw signature HTML (first 500 chars): %s", sig[:500])
            # Find image URLs before conversion
            raw_imgs = _IMG_SRC_RE.findall(sig)
            logger.info("Found %d image tags in signature: %s", len(raw_imgs), [img[1][:100] for img in raw_imgs])
            # Convert external image URLs to data URIs for frontend preview
            result = _inline_images_as_data_uris(sig, access_token)
            converted_imgs = _IMG_SRC_RE.findall(result)
            data_uri_count = sum(1 for img in converted_imgs if img[1].startswith("data:"))
            logger.info("After conversion: %d images, %d are data URIs", len(converted_imgs), data_uri_count)
            return result
        logger.warning("Gmail signature fetch failed (status %s): %s", response.status_code, response.text)
        return None
    except Exception as exc:
        logger.warning("Failed to fetch Gmail signature: %s", exc)
        return None


def _decrypt_tokens(credentials):
    try:
        return google_credentials_crud.decrypt_tokens(credentials)
    except EncryptionError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to read stored Google credentials.",
        ) from exc


def _resolve_access_token(db: Session, credentials) -> str:
    access_token, refresh_token = _decrypt_tokens(credentials)
    now = datetime.now(timezone.utc)

    if (
        access_token
        and credentials.token_expiry
        and credentials.token_expiry > now + timedelta(seconds=30)
    ):
        return access_token

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google session expired. Please reconnect your Google account.",
        )

    try:
        refreshed = refresh_access_token(refresh_token)
    except GoogleOAuthExchangeError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google rejected the refresh token. Reconnect your Google account.",
        ) from exc

    new_access = refreshed.get("access_token")
    expires_in = int(refreshed.get("expires_in") or 0)

    if not new_access or not expires_in:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google refresh response was incomplete.",
        )

    google_credentials_crud.update_access_token(db, credentials, new_access, expires_in)
    return new_access


def send_gmail_message(
    db: Session, user: User, request: GmailSendRequest
) -> GmailSendResponse:
    credentials = google_credentials_crud.get_credentials(db, user.user_id)
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account is not connected.",
        )

    access_token = _resolve_access_token(db, credentials)
    sender_email, from_header = _build_from_header(user, request.from_name)

    raw_message = _encode_message(
        from_header, request.to, request.subject, request.html, access_token
    )

    payload = {"raw": raw_message}
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(
            _GMAIL_SEND_URL, headers=headers, json=payload, timeout=10
        )
        response.raise_for_status()
    except requests.HTTPError as exc:
        body = response.text if response is not None else "<no response body>"
        logger.error("Gmail send failed (status %s): %s", response.status_code, body)
        if response.status_code == status.HTTP_401_UNAUTHORIZED:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google rejected the access token. Please reconnect your Google account.",
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Google Gmail API returned an error.",
        ) from exc
    except requests.RequestException as exc:
        logger.error("Gmail send request failed: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to reach Google Gmail API.",
        ) from exc

    data = response.json()
    return GmailSendResponse(id=data.get("id"), thread_id=data.get("threadId"))

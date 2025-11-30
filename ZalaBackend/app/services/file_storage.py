from __future__ import annotations

import os
import shutil
from pathlib import Path
from typing import Optional
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

BASE_DIR = Path(__file__).resolve().parent.parent
_DEFAULT_UPLOAD_ROOT = os.getenv("ZALA_UPLOAD_ROOT")
UPLOAD_ROOT = Path(_DEFAULT_UPLOAD_ROOT) if _DEFAULT_UPLOAD_ROOT else BASE_DIR.parent / "uploads"

_ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
_CONTENT_TYPE_FALLBACK = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/bmp": ".bmp",
}


def get_upload_root() -> Path:
    """Ensure the upload directory exists and return it."""
    UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    return UPLOAD_ROOT


def _safe_category(category: str) -> str:
    name = Path(category).name
    if name != category:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid upload category")
    return name


def _determine_extension(upload: UploadFile) -> str:
    original = Path(upload.filename or "").suffix.lower()
    if original in _ALLOWED_EXTENSIONS:
        return original
    if upload.content_type in _CONTENT_TYPE_FALLBACK:
        return _CONTENT_TYPE_FALLBACK[upload.content_type]
    return ".jpg"


def save_upload_file(upload: UploadFile, category: str) -> str:
    """Persist an uploaded image and return its public URL path."""
    if not upload.content_type or not upload.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Only image uploads allowed")

    safe_category = _safe_category(category)
    extension = _determine_extension(upload)

    folder = get_upload_root() / safe_category
    folder.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid4().hex}{extension}"
    destination = folder / filename

    upload.file.seek(0)
    with destination.open("wb") as buffer:
        shutil.copyfileobj(upload.file, buffer)

    return f"/uploads/{safe_category}/{filename}"


def remove_upload(public_path: Optional[str]) -> None:
    """Remove an uploaded file if it exists."""
    if not public_path:
        return

    marker = "/uploads/"
    relative_part: Optional[str] = None

    if public_path.startswith("http://") or public_path.startswith("https://") or public_path.startswith("//"):
        if marker in public_path:
            relative_part = public_path.split(marker, 1)[1]
    elif public_path.startswith("/uploads/"):
        relative_part = public_path[len(marker):]
    else:
        relative_part = public_path.lstrip("/")
        if relative_part.startswith("uploads/"):
            relative_part = relative_part[len("uploads/"):]

    if not relative_part:
        return

    target = get_upload_root() / relative_part
    try:
        if target.is_file():
            target.unlink()
    except OSError:
        pass
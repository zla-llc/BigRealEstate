"""
Zala branded email signature with embedded logo.

Provides:
  - get_signature_html()  → HTML string with a <img src="cid:zala_logo"> reference
  - attach_signature_logo(msg) → attaches the logo as a CID inline image to a MIMEMultipart
"""

import os
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from pathlib import Path

# Resolve logo path once at import time
_LOGO_PATH = Path(__file__).resolve().parent.parent / "assets" / "zala_logo.png"


def get_signature_html() -> str:
    """Return the Zala signature block as an HTML string.

    The logo is referenced via ``cid:zala_logo`` which must be paired with
    a call to ``attach_signature_logo`` on the same MIMEMultipart message.
    """
    return """
    <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 32px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
      <tr>
        <td style="vertical-align: middle; padding-right: 16px;">
          <img src="cid:zala_logo" alt="ZLA" width="80" style="display: block;" />
        </td>
        <td style="vertical-align: middle; font-family: Arial, sans-serif;">
          <p style="margin: 0; font-size: 16px; font-weight: bold; color: #333;">ZLA CRM</p>
          <p style="margin: 2px 0 0 0; font-size: 12px; color: #888;">Real Estate, Simplified.</p>
        </td>
      </tr>
    </table>
    """.strip()


def attach_signature_logo(msg: MIMEMultipart) -> None:
    """Read the Zala logo and attach it as an inline CID image.

    If the logo file is missing the call is silently skipped so emails
    can still be sent without a logo.
    """
    if not _LOGO_PATH.is_file():
        print(f"[EMAIL SIGNATURE] Logo not found at {_LOGO_PATH} – skipping logo attachment")
        return

    with open(_LOGO_PATH, "rb") as f:
        logo_data = f.read()

    logo_image = MIMEImage(logo_data, _subtype="png")
    logo_image.add_header("Content-ID", "<zala_logo>")
    logo_image.add_header("Content-Disposition", "inline", filename="zala_logo.png")
    msg.attach(logo_image)

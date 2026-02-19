"""Debug script to inspect Gmail signature HTML and image URLs."""
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import re
import requests

# Import all models first so relationships resolve
from app.models import (
    user, user_authentication, user_google_credentials, user_team,
    board, board_step, team, team_invitation, property, property_image,
    contact, lead, lead_image, address, unit,
    campaign, campaign_email, campaign_lead, notification, email_verification,
)

from app.db.session import SessionLocal
from app.db.crud import google_credentials as gc_crud, user as user_crud
from app.services.gmail import _resolve_access_token, _build_from_header, _GMAIL_SETTINGS_URL, _IMG_SRC_RE

db = SessionLocal()

from sqlalchemy import text
rows = db.execute(text('SELECT user_id FROM user_google_credentials LIMIT 1')).fetchall()
if not rows:
    print('No Google credentials found')
    sys.exit(1)

uid = rows[0][0]
print(f'User ID: {uid}')
creds = gc_crud.get_credentials(db, uid)
access_token = _resolve_access_token(db, creds)
user = user_crud.get_user_by_id(db, uid)
email, _ = _build_from_header(user, None)
print(f'Email: {email}')

url = f'{_GMAIL_SETTINGS_URL}/{email}'
headers = {'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'}
resp = requests.get(url, headers=headers, timeout=10)
print(f'Status: {resp.status_code}')
data = resp.json()
sig = data.get('signature', '')
print(f'\nRaw signature HTML:\n{sig}\n')

# Find image URLs
imgs = _IMG_SRC_RE.findall(sig)
print(f'Found {len(imgs)} image tags')
for prefix, img_url, suffix in imgs:
    print(f'\n  URL: {img_url}')
    # Try downloading without auth
    try:
        r1 = requests.get(img_url, timeout=10)
        ct1 = r1.headers.get('content-type', '?')
        print(f'  No auth: status={r1.status_code}, content-type={ct1}, size={len(r1.content)}')
    except Exception as e:
        print(f'  No auth: FAILED - {e}')
    # Try downloading with auth
    try:
        r2 = requests.get(img_url, headers={'Authorization': f'Bearer {access_token}'}, timeout=10)
        ct2 = r2.headers.get('content-type', '?')
        print(f'  With auth: status={r2.status_code}, content-type={ct2}, size={len(r2.content)}')
    except Exception as e:
        print(f'  With auth: FAILED - {e}')

db.close()

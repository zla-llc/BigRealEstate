import os
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())

import psycopg2

conn = psycopg2.connect(
    host=os.getenv("SQL_HOST"),
    database=os.getenv("SQL_DBNAME"),
    user=os.getenv("SQL_UNAME"),
    password=os.getenv("SQL_PASSWORD"),
    port=os.getenv("SQL_PORT")
)
cursor = conn.cursor()

# Check all users with their emails
print("=== All users ===")
cursor.execute("""
    SELECT u.user_id, u.username, c.email
    FROM users u
    LEFT JOIN contacts c ON u.contact_id = c.contact_id
    ORDER BY u.user_id DESC
    LIMIT 5
""")
rows = cursor.fetchall()
for r in rows:
    print(f"  UserID: {r[0]}, Username: {r[1]}, Email: {r[2]}")

# Check pending invitations
print("\n=== Pending invitations (status is NULL) ===")
cursor.execute("SELECT invitation_id, team_id, recipient_email, recipient_id FROM team_invitations WHERE status IS NULL ORDER BY invitation_id DESC LIMIT 10")
rows = cursor.fetchall()
for r in rows:
    print(f"  ID: {r[0]}, Team: {r[1]}, Email: {r[2]}, RecipientID: {r[3]}")

# Find invitation for test13
print("\n=== Looking for test13@gmail.com ===")
cursor.execute("SELECT invitation_id, recipient_email, recipient_id FROM team_invitations WHERE LOWER(recipient_email) LIKE '%test13%'")
rows = cursor.fetchall()
print(f"Found {len(rows)} invitations for test13")
for r in rows:
    print(f"  ID: {r[0]}, Email: {r[1]}, RecipientID: {r[2]}")

# Find user 10's email
cursor.execute("""
    SELECT u.user_id, c.email FROM users u 
    JOIN contacts c ON u.contact_id = c.contact_id 
    WHERE u.user_id = 10
""")
row = cursor.fetchone()
if row:
    print(f"\nUser 10 email: {row[1]}")

conn.close()

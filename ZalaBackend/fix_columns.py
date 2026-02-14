from app.db.session import engine
from sqlalchemy import text

with engine.connect() as conn:
    # Fix notifications table - rename notification_type to type
    try:
        conn.execute(text('ALTER TABLE notifications RENAME COLUMN notification_type TO type'))
        print('Renamed notification_type -> type')
    except Exception as e:
        print(f'notification_type rename: {e}')
    
    conn.commit()
    
    # Verify columns after
    result = conn.execute(text(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'notifications'"
    ))
    print('Notifications columns:', [row[0] for row in result])

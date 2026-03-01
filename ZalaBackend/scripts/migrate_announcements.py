"""
Migration script to add team_announcements table.
Run this script to create the announcements table.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import engine
from sqlalchemy import text


def run_migration():
    """Create team_announcements table and indexes."""
    
    # Create table
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS team_announcements (
        announcement_id SERIAL PRIMARY KEY,
        team_id         INTEGER NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
        author_id       INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        title           VARCHAR(255) NOT NULL,
        message         TEXT NOT NULL,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMPTZ
    )
    """
    
    # Create indexes
    index_sqls = [
        "CREATE INDEX IF NOT EXISTS idx_team_announcements_team_id ON team_announcements(team_id)",
        "CREATE INDEX IF NOT EXISTS idx_team_announcements_author_id ON team_announcements(author_id)",
        "CREATE INDEX IF NOT EXISTS idx_team_announcements_created_at ON team_announcements(created_at DESC)",
    ]
    
    with engine.connect() as conn:
        print("Creating team_announcements table...")
        conn.execute(text(create_table_sql))
        conn.commit()
        print("✅ Table created!")
        
        for index_sql in index_sqls:
            print(f"Creating index: {index_sql[:50]}...")
            conn.execute(text(index_sql))
            conn.commit()
        
        print("\n✅ Migration complete! team_announcements table and indexes created.")


if __name__ == "__main__":
    run_migration()

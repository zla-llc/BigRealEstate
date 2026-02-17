"""
CRUD operations for TeamAnnouncement model.
"""
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload

from app.models.team_announcement import TeamAnnouncement
from app.models.user import User
from app.models.contact import Contact
from app import schemas


def get_announcement_by_id(db: Session, announcement_id: int) -> Optional[TeamAnnouncement]:
    """Get a single announcement by ID."""
    return (
        db.query(TeamAnnouncement)
        .options(
            joinedload(TeamAnnouncement.author)
            .joinedload(User.contact)
        )
        .filter(TeamAnnouncement.announcement_id == announcement_id)
        .first()
    )


def get_announcements_by_team(
    db: Session, 
    team_id: int, 
    skip: int = 0, 
    limit: int = 50
) -> List[TeamAnnouncement]:
    """Get all announcements for a team, most recent first."""
    return (
        db.query(TeamAnnouncement)
        .options(
            joinedload(TeamAnnouncement.author)
            .joinedload(User.contact)
        )
        .filter(TeamAnnouncement.team_id == team_id)
        .order_by(TeamAnnouncement.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_announcement(
    db: Session,
    team_id: int,
    author_id: int,
    announcement_in: schemas.AnnouncementCreate
) -> TeamAnnouncement:
    """Create a new team announcement."""
    announcement = TeamAnnouncement(
        team_id=team_id,
        author_id=author_id,
        title=announcement_in.title,
        message=announcement_in.message
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    
    # Reload with relationships
    return get_announcement_by_id(db, announcement.announcement_id)


def update_announcement(
    db: Session,
    announcement_id: int,
    announcement_in: schemas.AnnouncementUpdate
) -> Optional[TeamAnnouncement]:
    """Update an existing announcement."""
    announcement = get_announcement_by_id(db, announcement_id)
    if not announcement:
        return None
    
    update_data = announcement_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(announcement, field, value)
    
    db.commit()
    db.refresh(announcement)
    return announcement


def delete_announcement(db: Session, announcement_id: int) -> bool:
    """Delete an announcement by ID."""
    announcement = db.query(TeamAnnouncement).filter(
        TeamAnnouncement.announcement_id == announcement_id
    ).first()
    
    if not announcement:
        return False
    
    db.delete(announcement)
    db.commit()
    return True

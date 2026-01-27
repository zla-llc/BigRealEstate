"""
CRUD operations for Notification model.
Handles in-app notifications for users.
"""
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload

from app.models.notification import Notification


def get_notification_by_id(db: Session, notification_id: int) -> Optional[Notification]:
    """Get a single notification by ID."""
    return (
        db.query(Notification)
        .options(joinedload(Notification.team_invitation))
        .filter(Notification.notification_id == notification_id)
        .first()
    )


def get_notifications_by_recipient(
    db: Session, 
    recipient_id: int, 
    skip: int = 0, 
    limit: int = 50,
    unread_only: bool = False
) -> List[Notification]:
    """Get notifications for a user."""
    query = (
        db.query(Notification)
        .options(joinedload(Notification.team_invitation))
        .filter(Notification.recipient_id == recipient_id)
    )
    
    if unread_only:
        query = query.filter(Notification.viewed == False)
    
    return (
        query
        .order_by(Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_unread_count(db: Session, recipient_id: int) -> int:
    """Get count of unread notifications for a user."""
    return (
        db.query(Notification)
        .filter(
            Notification.recipient_id == recipient_id,
            Notification.viewed == False
        )
        .count()
    )


def create_notification(
    db: Session,
    recipient_id: int,
    notification_type: str,
    title: str,
    message: str,
    sender_id: Optional[int] = None,
    invitation_id: Optional[int] = None
) -> Notification:
    """Create a new notification."""
    notification = Notification(
        recipient_id=recipient_id,
        type=notification_type,
        title=title,
        message=message,
        sender_id=sender_id,
        invitation_id=invitation_id,
        viewed=False
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def mark_as_viewed(db: Session, notification_id: int) -> Optional[Notification]:
    """Mark a notification as viewed."""
    notification = get_notification_by_id(db, notification_id)
    if not notification:
        return None
    
    notification.viewed = True
    db.commit()
    db.refresh(notification)
    return notification


def mark_all_as_viewed(db: Session, recipient_id: int) -> int:
    """Mark all notifications as viewed for a user. Returns count of updated notifications."""
    result = (
        db.query(Notification)
        .filter(
            Notification.recipient_id == recipient_id,
            Notification.viewed == False
        )
        .update({"viewed": True})
    )
    db.commit()
    return result


def delete_notification(db: Session, notification_id: int) -> bool:
    """Delete a notification."""
    notification = get_notification_by_id(db, notification_id)
    if not notification:
        return False
    
    db.delete(notification)
    db.commit()
    return True


def delete_notifications_by_invitation(db: Session, invitation_id: int) -> int:
    """Delete all notifications related to an invitation. Returns count of deleted."""
    result = (
        db.query(Notification)
        .filter(Notification.invitation_id == invitation_id)
        .delete()
    )
    db.commit()
    return result

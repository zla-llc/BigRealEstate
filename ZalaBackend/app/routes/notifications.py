"""
Notification routes.
Handles in-app notifications for users.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.db.crud import notification as notification_crud
from app.db.session import get_db

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/user/{user_id}", response_model=List[schemas.NotificationPublic])
def get_user_notifications(
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False,
    db: Session = Depends(get_db)
):
    """
    Get all notifications for a user.
    
    - **user_id**: The user's ID
    - **skip**: Number of notifications to skip (pagination)
    - **limit**: Max notifications to return
    - **unread_only**: If true, only return unread notifications
    """
    notifications = notification_crud.get_notifications_by_recipient(
        db, user_id, skip=skip, limit=limit, unread_only=unread_only
    )
    
    # Convert to response with team_id
    result = []
    for notif in notifications:
        notif_dict = {
            "notification_id": notif.notification_id,
            "type": notif.type,
            "title": notif.title,
            "message": notif.message,
            "viewed": notif.viewed,
            "recipient_id": notif.recipient_id,
            "sender_id": notif.sender_id,
            "invitation_id": notif.invitation_id,
            "team_id": notif.team_invitation.team_id if notif.team_invitation else None,
            "created_at": notif.created_at,
        }
        result.append(schemas.NotificationPublic(**notif_dict))
    
    return result


@router.get("/user/{user_id}/unread-count")
def get_unread_notification_count(user_id: int, db: Session = Depends(get_db)):
    """Get the count of unread notifications for a user."""
    count = notification_crud.get_unread_count(db, user_id)
    return {"user_id": user_id, "unread_count": count}


@router.get("/{notification_id}", response_model=schemas.NotificationPublic)
def get_notification(notification_id: int, db: Session = Depends(get_db)):
    """Get a specific notification by ID."""
    notification = notification_crud.get_notification_by_id(db, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return notification


@router.patch("/{notification_id}/read", response_model=schemas.NotificationPublic)
def mark_notification_as_read(notification_id: int, db: Session = Depends(get_db)):
    """Mark a notification as read/viewed."""
    notification = notification_crud.mark_as_viewed(db, notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return notification


@router.patch("/user/{user_id}/read-all")
def mark_all_notifications_as_read(user_id: int, db: Session = Depends(get_db)):
    """Mark all notifications as read for a user."""
    count = notification_crud.mark_all_as_viewed(db, user_id)
    return {"message": f"Marked {count} notifications as read", "updated_count": count}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(notification_id: int, db: Session = Depends(get_db)):
    """Delete a notification."""
    if not notification_crud.delete_notification(db, notification_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return None

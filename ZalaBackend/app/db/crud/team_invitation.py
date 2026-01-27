"""
CRUD operations for TeamInvitation model.
Handles invitations to join teams.
"""
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload

from app.models.team_invitation import TeamInvitation
from app.models.team import Team
from app.models.user import User
from app.models.contact import Contact
from app.models.user_team import UserTeam
from app import schemas


def get_invitation_by_id(db: Session, invitation_id: int) -> Optional[TeamInvitation]:
    """Get a single invitation by ID."""
    return (
        db.query(TeamInvitation)
        .options(joinedload(TeamInvitation.team))
        .filter(TeamInvitation.invitation_id == invitation_id)
        .first()
    )


def get_invitations_by_team(db: Session, team_id: int) -> List[TeamInvitation]:
    """Get all invitations for a team."""
    return (
        db.query(TeamInvitation)
        .filter(TeamInvitation.team_id == team_id)
        .order_by(TeamInvitation.created_at.desc())
        .all()
    )


def get_invitations_by_recipient_email(db: Session, email: str) -> List[TeamInvitation]:
    """Get all invitations for a recipient email."""
    return (
        db.query(TeamInvitation)
        .options(joinedload(TeamInvitation.team))
        .filter(TeamInvitation.recipient_email == email)
        .order_by(TeamInvitation.created_at.desc())
        .all()
    )


def get_invitations_by_recipient_id(db: Session, user_id: int) -> List[TeamInvitation]:
    """Get all invitations for a user (by their user_id)."""
    return (
        db.query(TeamInvitation)
        .options(joinedload(TeamInvitation.team))
        .filter(TeamInvitation.recipient_id == user_id)
        .order_by(TeamInvitation.created_at.desc())
        .all()
    )


def get_pending_invitations_by_recipient_id(db: Session, user_id: int) -> List[TeamInvitation]:
    """Get all pending invitations for a user (status = None)."""
    return (
        db.query(TeamInvitation)
        .options(joinedload(TeamInvitation.team))
        .filter(TeamInvitation.recipient_id == user_id, TeamInvitation.status.is_(None))
        .order_by(TeamInvitation.created_at.desc())
        .all()
    )


def create_invitation(
    db: Session,
    team_id: int,
    sender_id: int,
    recipient_email: str,
    recipient_id: Optional[int] = None
) -> TeamInvitation:
    """Create a new team invitation."""
    invitation = TeamInvitation(
        team_id=team_id,
        sender_id=sender_id,
        recipient_email=recipient_email,
        recipient_id=recipient_id,
        status=None  # Pending
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    return invitation


def update_invitation_status(
    db: Session,
    invitation_id: int,
    status: bool
) -> Optional[TeamInvitation]:
    """
    Update invitation status.
    True = Accepted, False = Declined
    """
    invitation = get_invitation_by_id(db, invitation_id)
    if not invitation:
        return None
    
    invitation.status = status
    db.commit()
    db.refresh(invitation)
    return invitation


def delete_invitation(db: Session, invitation_id: int) -> bool:
    """Delete an invitation."""
    invitation = get_invitation_by_id(db, invitation_id)
    if not invitation:
        return False
    
    db.delete(invitation)
    db.commit()
    return True


def check_existing_invitation(
    db: Session,
    team_id: int,
    recipient_email: str
) -> Optional[TeamInvitation]:
    """Check if there's already a pending invitation for this email and team."""
    return (
        db.query(TeamInvitation)
        .filter(
            TeamInvitation.team_id == team_id,
            TeamInvitation.recipient_email == recipient_email,
            TeamInvitation.status.is_(None)  # Pending only
        )
        .first()
    )


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by their contact email."""
    return (
        db.query(User)
        .join(Contact)
        .filter(Contact.email == email)
        .first()
    )


def is_user_in_team(db: Session, team_id: int, user_id: int) -> bool:
    """Check if user is already in the team."""
    return (
        db.query(UserTeam)
        .filter(UserTeam.team_id == team_id, UserTeam.user_id == user_id)
        .first() is not None
    )


def is_user_admin_of_team(db: Session, team_id: int, user_id: int) -> bool:
    """Check if user is an admin of the team."""
    user_team = (
        db.query(UserTeam)
        .filter(UserTeam.team_id == team_id, UserTeam.user_id == user_id)
        .first()
    )
    return user_team is not None and user_team.role == "admin"


def get_pending_invitations_by_email(db: Session, email: str) -> List[TeamInvitation]:
    """Get all pending invitations for an email address (status = None)."""
    return (
        db.query(TeamInvitation)
        .options(joinedload(TeamInvitation.team))
        .filter(
            TeamInvitation.recipient_email == email,
            TeamInvitation.status.is_(None)  # Pending only
        )
        .order_by(TeamInvitation.created_at.desc())
        .all()
    )


def link_pending_invitations_to_user(db: Session, user_id: int, email: str) -> List[TeamInvitation]:
    """
    Link all pending invitations for an email to a new user.
    Updates recipient_id on all pending invitations matching the email.
    Returns the list of updated invitations.
    """
    from app.db.crud import notification as notification_crud
    
    pending_invitations = get_pending_invitations_by_email(db, email)
    
    for invitation in pending_invitations:
        # Update the invitation with the user's ID
        invitation.recipient_id = user_id
        
        team_name = invitation.team.team_name if invitation.team else "a team"
        
        # Create notification for each pending invitation
        notification_crud.create_notification(
            db=db,
            recipient_id=user_id,
            notification_type="team_invite",
            title=f"Team Invitation: {team_name}",
            message=f"You have been invited to join the team '{team_name}'",
            sender_id=invitation.sender_id,
            invitation_id=invitation.invitation_id
        )
    
    if pending_invitations:
        db.commit()
    
    return pending_invitations

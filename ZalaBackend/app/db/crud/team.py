from typing import List, Optional

from sqlalchemy.orm import Session, joinedload

from app import schemas
from app.models.team import Team
from app.models.user import User
from app.models.user_team import UserTeam

# Fields that are not actual columns on the Team model
EXCLUDED_RELATIONSHIP_FIELDS = ("member_ids", "property_ids", "board_ids")


def _prepare_team_payload(payload: dict) -> dict:
    """Remove relationship fields that shouldn't be passed to Team constructor."""
    return {k: v for k, v in payload.items() if k not in EXCLUDED_RELATIONSHIP_FIELDS}


def get_team_by_id(db: Session, team_id: int) -> Optional[Team]:
    """Return a single team by id."""

    return (
        db.query(Team)
        .options(joinedload(Team.member_links).joinedload(UserTeam.user))
        .filter(Team.team_id == team_id)
        .first()
    )


def get_team_with_members(db: Session, team_id: int) -> Optional[Team]:
    """Return a single team by id with all members loaded. Alias for get_team_by_id."""
    return get_team_by_id(db, team_id)


def get_teams(db: Session, skip: int = 0, limit: int = 100) -> List[Team]:
    """Return a paginated list of teams."""

    return (
        db.query(Team)
        .options(joinedload(Team.member_links).joinedload(UserTeam.user))
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_teams_by_user(db: Session, user_id: int) -> List[Team]:
    """Return all teams a user belongs to."""
    
    return (
        db.query(Team)
        .join(UserTeam)
        .options(joinedload(Team.member_links).joinedload(UserTeam.user))
        .filter(UserTeam.user_id == user_id)
        .all()
    )


def create_team(db: Session, team_in: schemas.TeamCreate) -> Team:
    """Persist a new team."""

    payload = _prepare_team_payload(team_in.model_dump())
    team = Team(**payload)
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


def create_team_with_admin(db: Session, team_in: schemas.TeamCreate, admin_user_id: int) -> Team:
    """Create a team and set the creator as admin."""
    
    payload = _prepare_team_payload(team_in.model_dump())
    team = Team(**payload)
    team.created_by_user_id = admin_user_id  # Track who created the team
    db.add(team)
    db.flush()  # Get the team_id
    
    # Add creator as admin
    user_team = UserTeam(
        user_id=admin_user_id,
        team_id=team.team_id,
        role="admin"
    )
    db.add(user_team)
    db.commit()
    db.refresh(team)
    return team


def update_team(db: Session, team_id: int, team_in: schemas.TeamUpdate) -> Optional[Team]:
    """Update an existing team."""

    team = get_team_by_id(db, team_id)
    if not team:
        return None

    update_data = _prepare_team_payload(team_in.model_dump(exclude_unset=True))
    for field, value in update_data.items():
        setattr(team, field, value)

    db.add(team)
    db.commit()
    db.refresh(team)
    return team


def delete_team(db: Session, team_id: int) -> bool:
    """Delete a team by id."""

    team = get_team_by_id(db, team_id)
    if not team:
        return False

    db.delete(team)
    db.commit()
    return True


def _append_unique_id(values: List[int], user_id: int) -> List[int]:
    """Return a new list with user_id appended if it was not already present."""

    if values is None:
        values = []
    if user_id in values:
        return values
    return values + [user_id]


def _remove_id(values: List[int], user_id: int) -> List[int]:
    """Return a new list without user_id (if present)."""

    if not values:
        return []
    return [value for value in values if value != user_id]


def add_member(db: Session, team_id: int, user_id: int, role: str = "member") -> Optional[Team]:
    """Add a user to the team with specified role using UserTeam relationship."""

    team = get_team_by_id(db, team_id)
    if not team:
        return None
    
    # Check if user already in team
    existing = db.query(UserTeam).filter(
        UserTeam.team_id == team_id,
        UserTeam.user_id == user_id
    ).first()
    
    if existing:
        # Update role if already exists
        existing.role = role
    else:
        # Create new link
        user_team = UserTeam(
            user_id=user_id,
            team_id=team_id,
            role=role
        )
        db.add(user_team)
    
    db.commit()
    db.refresh(team)
    return team


def remove_member(db: Session, team_id: int, user_id: int) -> Optional[Team]:
    """Remove a user from the team."""

    team = get_team_by_id(db, team_id)
    if not team:
        return None

    # Find and delete the user_team link
    user_team = db.query(UserTeam).filter(
        UserTeam.team_id == team_id,
        UserTeam.user_id == user_id
    ).first()
    
    if user_team:
        db.delete(user_team)
        db.commit()
        db.refresh(team)
    
    return team


def add_admin(db: Session, team_id: int, user_id: int) -> Optional[Team]:
    """Add a user as admin to the team."""
    return add_member(db, team_id, user_id, role="admin")


def remove_admin(db: Session, team_id: int, user_id: int) -> Optional[Team]:
    """Remove admin role from user (demote to member)."""
    
    team = get_team_by_id(db, team_id)
    if not team:
        return None

    user_team = db.query(UserTeam).filter(
        UserTeam.team_id == team_id,
        UserTeam.user_id == user_id
    ).first()
    
    if user_team and user_team.role == "admin":
        # Demote to member instead of removing
        user_team.role = "member"
        db.commit()
        db.refresh(team)
    
    return team


def get_user_role_in_team(db: Session, team_id: int, user_id: int) -> Optional[str]:
    """Get a user's role in a team. Returns None if not in team."""
    
    user_team = db.query(UserTeam).filter(
        UserTeam.team_id == team_id,
        UserTeam.user_id == user_id
    ).first()
    
    return user_team.role if user_team else None


def is_user_admin(db: Session, team_id: int, user_id: int) -> bool:
    """Check if user is admin of the team."""
    role = get_user_role_in_team(db, team_id, user_id)
    return role == "admin"


def get_leaderboard(db: Session, limit: int = 10) -> List[Team]:
    """Return teams ordered by XP descending for leaderboard views."""

    safe_limit = max(1, min(limit, 1000))
    return (
        db.query(Team)
        .order_by(Team.xp.desc(), Team.team_name.asc())
        .limit(safe_limit)
        .all()
    )


def get_team_users_by_xp(db: Session, team_id: int) -> Optional[List[tuple]]:
    """Return (user_id, username, xp) tuples ordered by XP for the given team."""

    team = get_team_by_id(db, team_id)
    if not team:
        return None

    # Get user IDs from member_links
    user_ids = [link.user_id for link in team.member_links]

    if not user_ids:
        return []

    rows = (
        db.query(User.user_id, User.username, User.xp)
        .filter(User.user_id.in_(user_ids))
        .order_by(User.xp.desc(), User.username.asc())
        .all()
    )
    return rows

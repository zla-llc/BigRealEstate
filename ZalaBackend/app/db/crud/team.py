from typing import List, Optional

from sqlalchemy.orm import Session

from app import schemas
from app.models.team import Team
from app.models.user import User

OPTIONAL_ARRAY_FIELDS = ("member_ids", "property_ids", "board_ids")


def _normalize_optional_arrays(payload: dict, *, include_missing: bool) -> dict:
    """Convert optional list fields to empty lists when omitted or None."""

    for field in OPTIONAL_ARRAY_FIELDS:
        if include_missing:
            if payload.get(field) is None:
                payload[field] = []
        elif field in payload and payload[field] is None:
            payload[field] = []
    return payload


def get_team_by_id(db: Session, team_id: int) -> Optional[Team]:
    """Return a single team by id."""

    return db.query(Team).filter(Team.team_id == team_id).first()


def get_teams(db: Session, skip: int = 0, limit: int = 100) -> List[Team]:
    """Return a paginated list of teams."""

    return db.query(Team).offset(skip).limit(limit).all()


def create_team(db: Session, team_in: schemas.TeamCreate) -> Team:
    """Persist a new team."""

    payload = _normalize_optional_arrays(
        team_in.model_dump(), include_missing=True
    )
    team = Team(**payload)
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


def update_team(db: Session, team_id: int, team_in: schemas.TeamUpdate) -> Optional[Team]:
    """Update an existing team."""

    team = get_team_by_id(db, team_id)
    if not team:
        return None

    update_data = _normalize_optional_arrays(
        team_in.model_dump(exclude_unset=True), include_missing=False
    )
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


def add_member(db: Session, team_id: int, user_id: int) -> Optional[Team]:
    """Add a user to the member list."""

    team = get_team_by_id(db, team_id)
    if not team:
        return None

    team.member_ids = _append_unique_id(list(team.member_ids or []), user_id)
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


def remove_member(db: Session, team_id: int, user_id: int) -> Optional[Team]:
    """Remove a user from the member list."""

    team = get_team_by_id(db, team_id)
    if not team:
        return None

    team.member_ids = _remove_id(list(team.member_ids or []), user_id)
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


def add_admin(db: Session, team_id: int, user_id: int) -> Optional[Team]:
    """Add a user to the admin list and ensure they are not duplicated as a member."""

    team = get_team_by_id(db, team_id)
    if not team:
        return None

    team.admin_ids = _append_unique_id(list(team.admin_ids or []), user_id)
    # Optional: keep the member list free of duplicates
    team.member_ids = _remove_id(list(team.member_ids or []), user_id)

    db.add(team)
    db.commit()
    db.refresh(team)
    return team


def remove_admin(db: Session, team_id: int, user_id: int) -> Optional[Team]:
    """Remove a user from the admin list."""

    team = get_team_by_id(db, team_id)
    if not team:
        return None

    team.admin_ids = _remove_id(list(team.admin_ids or []), user_id)
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


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
    """Return (user_id, username) pairs ordered by XP for the given team."""

    team = get_team_by_id(db, team_id)
    if not team:
        return None

    user_ids: List[int] = []
    if team.admin_ids:
        user_ids.extend(team.admin_ids)
    if team.member_ids:
        user_ids.extend(team.member_ids)

    # Preserve order but drop duplicates.
    seen = set()
    unique_ids = []
    for user_id in user_ids:
        if user_id not in seen:
            seen.add(user_id)
            unique_ids.append(user_id)

    if not unique_ids:
        return []

    rows = (
        db.query(User.user_id, User.username, User.xp)
        .filter(User.user_id.in_(unique_ids))
        .order_by(User.xp.desc(), User.username.asc())
        .all()
    )
    return rows

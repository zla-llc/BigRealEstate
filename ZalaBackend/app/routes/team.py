from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.db.crud import team as team_crud
from app.db.session import get_db

router = APIRouter(prefix="/teams", tags=["Teams"])


@router.post("/", response_model=schemas.TeamPublic, status_code=status.HTTP_201_CREATED)
def create_team(team_in: schemas.TeamCreate, db: Session = Depends(get_db)):
    """Create a new team."""

    return team_crud.create_team(db, team_in)


@router.get("/", response_model=List[schemas.TeamPublic])
def list_teams(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List teams with basic pagination."""

    return team_crud.get_teams(db, skip=skip, limit=limit)


@router.get("/leaderboard", response_model=List[schemas.TeamLeaderboardEntry])
def leaderboard(limit: int = 10, db: Session = Depends(get_db)):
    """Return teams sorted by XP for leaderboard views."""

    teams = team_crud.get_leaderboard(db, limit=limit)
    return [
        schemas.TeamLeaderboardEntry(
            team_id=team.team_id, team_name=team.team_name, xp=team.xp
        )
        for team in teams
    ]


@router.get(
    "/{team_id}/users/xp",
    response_model=List[schemas.TeamUserXPEntry],
    summary="List team users ordered by XP",
)
def list_team_users_by_xp(team_id: int, db: Session = Depends(get_db)):
    """Return team members (admins + members) ordered by XP desc."""

    rows = team_crud.get_team_users_by_xp(db, team_id)
    if rows is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    return [
        schemas.TeamUserXPEntry(user_id=row.user_id, username=row.username, xp=row.xp)
        for row in rows
    ]


@router.get("/{team_id}", response_model=schemas.TeamPublic)
def read_team(team_id: int, db: Session = Depends(get_db)):
    """Retrieve a team by id."""

    team = team_crud.get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    return team


@router.put("/{team_id}", response_model=schemas.TeamPublic)
def update_team(team_id: int, team_in: schemas.TeamUpdate, db: Session = Depends(get_db)):
    """Update mutable team fields."""

    team = team_crud.update_team(db, team_id, team_in)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    return team


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(team_id: int, db: Session = Depends(get_db)):
    """Delete a team."""

    if not team_crud.delete_team(db, team_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    return None

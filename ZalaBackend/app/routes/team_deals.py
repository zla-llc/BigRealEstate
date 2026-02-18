from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app import schemas
from app.db.crud import team_deal as deal_crud

router = APIRouter(tags=["Team Deals"])


@router.post("/team/{team_id}/property/{property_id}/close", response_model=schemas.TeamDealPublic, status_code=status.HTTP_201_CREATED)
def create_team_deal(deal_create: schemas.TeamDealCreateRequest, team_id: int, property_id: int, db: Session = Depends(get_db)):
    """Create team deal with team id and property id"""
    deal_data = schemas.TeamDealCreate(
        team_id=team_id,
        property_id=property_id,
        user_id=deal_create.user_id,
        lead_id=deal_create.lead_id,
        sale_price=deal_create.sale_price,
        xp_earned=deal_create.xp_earned,
        notes=deal_create.notes,
        closed_at=deal_create.closed_at
    )

    return deal_crud.create_deal(db=db, deal=deal_data)


@router.get("/team_deals/{deal_id}", response_model=schemas.TeamDealPublic)
def get_team_deal(deal_id: int, db: Session = Depends(get_db)):
    """
    Get a specific deal by ID.
    """
    deal = deal_crud.get_deal(db, deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal


@router.get("/team_deals/", response_model=List[schemas.TeamDealPublic])
def get_all_deals(skip: int = 0, limit: int = 100, team_id: Optional[int] = None, db: Session = Depends(get_db)):
    """List deals. Optional filter by team_id."""
    return deal_crud.get_deals(db, skip=skip, limit=limit, team_id=team_id)


@router.patch("/team_deals/{deal_id}", response_model=schemas.TeamDealPublic)
def update_team_deal(deal_id: int, deal_update: schemas.TeamDealUpdate, db: Session = Depends(get_db)):
    """Update deal details (price, notes, etc)."""
    updated_deal = deal_crud.update_deal(db, deal_id, deal_update)
    if not updated_deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return updated_deal


@router.delete("/team_deals/{deal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team_deal(deal_id: int, db: Session = Depends(get_db)):
    """Remove a deal entry."""
    success = deal_crud.delete_deal(db, deal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Deal not found")
    return None

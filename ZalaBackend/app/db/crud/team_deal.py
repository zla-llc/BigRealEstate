from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.team_deal import TeamDeal
from app import schemas


def create_deal(db: Session, deal: schemas.TeamDealCreate) -> TeamDeal:
    db_deal = TeamDeal(
        team_id=deal.team_id,
        user_id=deal.user_id,
        property_id=deal.property_id,
        lead_id=deal.lead_id,
        sale_price=deal.sale_price,
        xp_earned=deal.xp_earned,
        notes=deal.notes,
    )
    if deal.closed_at:
        db_deal.closed_at = deal.closed_at

    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return db_deal


def get_deal(db: Session, deal_id: int) -> Optional[TeamDeal]:
    return db.query(TeamDeal).filter(TeamDeal.deal_id == deal_id).first()


def get_deals(db: Session, skip: int = 0, limit: int = 100, team_id: Optional[int] = None) -> List[TeamDeal]:
    query = db.query(TeamDeal)
    if team_id:
        query = query.filter(TeamDeal.team_id == team_id)
    return query.offset(skip).limit(limit).all()


def update_deal(db: Session, deal_id: int, deal_update: schemas.TeamDealUpdate) -> Optional[TeamDeal]:
    db_deal = get_deal(db, deal_id)
    if not db_deal:
        return None

    update_data = deal_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_deal, key, value)

    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return db_deal


def delete_deal(db: Session, deal_id: int) -> bool:
    db_deal = get_deal(db, deal_id)
    if not db_deal:
        return False

    db.delete(db_deal)
    db.commit()
    return True

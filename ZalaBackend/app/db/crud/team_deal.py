from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.team_deal import TeamDeal
from app import schemas

from app.models.team import Team


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
    db_team = (db.query(Team).filter(Team.team_id == deal.team_id).first())

    if db_team:
        current_xp = db_team.xp or 0
        db_team.xp = current_xp + deal.xp_earned
        db.add(db_team)

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


def get_user_total_xp(db: Session, user_id: int) -> int:
    """ Total team deal xp """
    total = db.query(func.sum(TeamDeal.xp_earned)).filter(TeamDeal.user_id == user_id).scalar()
    if total is None:
        return 0

    return total

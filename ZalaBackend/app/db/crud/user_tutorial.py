from typing import Optional
from sqlalchemy.orm import Session
from app.models.user_tutorial import UserTutorial
from app.schemas.user_tutorial import UserTutorialCreate, UserTutorialUpdate


def create_user_tutorial(db: Session, tutorial: UserTutorialCreate) -> UserTutorial:
    """Create new tutorial"""
    db_tutorial = UserTutorial(user_id=tutorial.user_id)
    db.add(db_tutorial)
    db.commit()
    db.refresh(db_tutorial)
    return db_tutorial


def get_tutorial_by_user(db: Session, user_id: int) -> Optional[UserTutorial]:
    """get tutorial"""
    return db.query(UserTutorial).filter(UserTutorial.user_id == user_id).first()


def update_tutorial(db: Session, user_id: int, tutorial_update: UserTutorialUpdate) -> Optional[UserTutorial]:
    """update tutorial"""
    db_tutorial = get_tutorial_by_user(db, user_id)

    if not db_tutorial:
        return None

    update_data = tutorial_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_tutorial, key, value)

    db.add(db_tutorial)
    db.commit()
    db.refresh(db_tutorial)
    return db_tutorial


def delete_tutorial(db: Session, user_id: int) -> bool:
    """delete tutorial"""
    db_tutorial = get_tutorial_by_user(db, user_id)
    if not db_tutorial:
        return False

    db.delete(db_tutorial)
    db.commit()
    return True

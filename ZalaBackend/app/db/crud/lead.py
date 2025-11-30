from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload, selectinload
from typing import List, Optional

from fastapi import UploadFile

from app.models.lead import Lead
from app.models.lead_image import LeadImage
from app.models.property import Property
from app.models.user import User
from app.models.address import Address
from app.models.contact import Contact
from app import schemas
from fastapi import HTTPException, status

from app.models import CampaignLead
from app.services.file_storage import save_upload_file, remove_upload


def get_lead_by_id(db: Session, lead_id: int) -> Optional[Lead]:
    return (
        db.query(Lead)
        .options(
            selectinload(Lead.properties).joinedload(Property.address),
            selectinload(Lead.properties).selectinload(Property.units),
            selectinload(Lead.properties).joinedload(Property.users),
            joinedload(Lead.created_by_user),
            joinedload(Lead.contact),
            joinedload(Lead.address),
            selectinload(Lead.campaigns).joinedload(CampaignLead.campaign),
            selectinload(Lead.images),
        )
        .filter(Lead.lead_id == lead_id)
        .first()
    )


def get_leads(db: Session, skip: int = 0, limit: int = 100, lead_ids: Optional[List[int]] = None) -> List[Lead]:
    query = (
        db.query(Lead)
        .options(
            selectinload(Lead.properties).joinedload(Property.address),
            selectinload(Lead.properties).selectinload(Property.units),
            selectinload(Lead.properties).joinedload(Property.users),
            joinedload(Lead.created_by_user),
            joinedload(Lead.contact),
            joinedload(Lead.address),
            selectinload(Lead.campaigns).joinedload(CampaignLead.campaign),
            selectinload(Lead.images),
        )
    )
    if lead_ids:
        query = query.filter(Lead.lead_id.in_(lead_ids))
    return query.offset(skip).limit(limit).all()


def create_lead(db: Session, lead_in: schemas.LeadCreate) -> Lead:
    db_lead = Lead(
        person_type=lead_in.person_type,
        business=lead_in.business,
        website=lead_in.website,
        license_num=lead_in.license_num,
        notes=lead_in.notes,
        image_url=lead_in.image_url,
    )
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


def update_lead(db: Session, lead_id: int, lead_in: schemas.LeadUpdate) -> Optional[Lead]:
    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not db_lead:
        return None

    update_data = lead_in.dict(exclude_unset=True)
    for k, v in update_data.items():
        setattr(db_lead, k, v)

    db.commit()
    db.refresh(db_lead)
    return db_lead


def delete_lead(db: Session, lead_id: int) -> bool:
    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not db_lead:
        return False
    remove_upload(db_lead.image_url)
    for image in list(getattr(db_lead, "images", []) or []):
        remove_upload(image.image_url)
    # unlink properties first
    for prop in db_lead.properties:
        prop.lead_id = None
        db.add(prop)
    db.delete(db_lead)
    db.commit()
    return True


def link_property_to_lead(db: Session, lead_id: int, property_id: int) -> Optional[Lead]:
    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not db_lead:
        return None
    prop = db.query(Property).filter(Property.property_id == property_id).first()
    if not prop:
        return None
    prop.lead_id = lead_id
    db.add(prop)
    db.commit()
    db.refresh(db_lead)
    return db_lead


def unlink_property_from_lead(db: Session, lead_id: int, property_id: int) -> Optional[Lead]:
    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not db_lead:
        return None
    prop = db.query(Property).filter(Property.property_id == property_id).first()
    if not prop:
        return None
    if prop.lead_id != lead_id:
        return db_lead
    prop.lead_id = None
    db.add(prop)
    db.commit()
    db.refresh(db_lead)
    return db_lead


def link_user_to_lead(db: Session, lead_id: int, user_id: int) -> Optional[Lead]:
    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not db_lead:
        return None
    # load the user's contact relationship as well so we can copy contact_id if present
    user = db.query(User).options(joinedload(User.contact)).filter(User.user_id == user_id).first()
    if not user:
        return None
    # set created_by and also copy the user's contact_id into the lead if available
    db_lead.created_by = user.user_id
    # try the contact_id column first; if it's None, fall back to the loaded contact relationship
    contact_id = getattr(user, "contact_id", None)
    if not contact_id and getattr(user, "contact", None):
        contact_id = getattr(user.contact, "contact_id", None)
    if contact_id:
        db_lead.contact_id = contact_id
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


def unlink_user_from_lead(db: Session, lead_id: int, user_id: int) -> Optional[Lead]:
    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not db_lead:
        return None
    if db_lead.created_by != user_id:
        return db_lead
    # clear created_by and also clear contact_id which was populated when the user was linked
    db_lead.created_by = None
    db_lead.contact_id = None
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


def link_contact_to_lead(db: Session, lead_id: int, contact_id: int) -> Optional[Lead]:
    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not db_lead:
        return None
    contact = db.query(Contact).filter(Contact.contact_id == contact_id).first()
    if not contact:
        return None
    # ensure the contact is not already linked to a different lead (contact_id is unique on leads)
    existing = db.query(Lead).filter(Lead.contact_id == contact_id).first()
    if existing and existing.lead_id != lead_id:
        return None
    db_lead.contact_id = contact_id
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


def unlink_contact_from_lead(db: Session, lead_id: int, contact_id: int) -> Optional[Lead]:
    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not db_lead:
        return None
    if db_lead.contact_id != contact_id:
        return db_lead
    db_lead.contact_id = None
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


def link_address_to_lead(db: Session, lead_id: int, address_id: int) -> Optional[Lead]:
    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not db_lead:
        return None
    address = db.query(Address).filter(Address.address_id == address_id).first()
    if not address:
        return None
    # guard against violating the unique constraint on lead.address_id
    existing = db.query(Lead).filter(Lead.address_id == address_id).first()
    if existing and existing.lead_id != lead_id:
        return None
    db_lead.address_id = address_id
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


def unlink_address_from_lead(db: Session, lead_id: int, address_id: int) -> Optional[Lead]:
    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not db_lead:
        return None
    if db_lead.address_id != address_id:
        return db_lead
    db_lead.address_id = None
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


def _next_lead_image_order(db: Session, lead_id: int) -> int:
    current_max = db.query(func.max(LeadImage.sort_order)).filter(LeadImage.lead_id == lead_id).scalar()
    return (current_max or 0) + 1


def list_lead_images(db: Session, lead_id: int) -> List[LeadImage]:
    return (
        db.query(LeadImage)
        .filter(LeadImage.lead_id == lead_id)
        .order_by(LeadImage.sort_order.asc(), LeadImage.lead_image_id.asc())
        .all()
    )


def add_lead_image(
    db: Session,
    lead_id: int,
    upload: UploadFile,
    caption: Optional[str] = None,
    sort_order: Optional[int] = None,
) -> Optional[LeadImage]:
    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not db_lead:
        return None

    new_path = save_upload_file(upload, "leads")
    effective_order = sort_order if sort_order is not None else _next_lead_image_order(db, lead_id)

    image = LeadImage(
        lead_id=lead_id,
        image_url=new_path,
        caption=caption,
        sort_order=effective_order,
    )

    db.add(image)
    if not db_lead.image_url:
        db_lead.image_url = new_path
        db.add(db_lead)

    db.commit()
    db.refresh(image)
    return image


def _sync_primary_lead_image(db: Session, lead: Lead) -> None:
    first_image = (
        db.query(LeadImage)
        .filter(LeadImage.lead_id == lead.lead_id)
        .order_by(LeadImage.sort_order.asc(), LeadImage.lead_image_id.asc())
        .first()
    )
    lead.image_url = first_image.image_url if first_image else None
    db.add(lead)
    db.commit()
    db.refresh(lead)


def delete_lead_image(db: Session, lead_id: int, image_id: int) -> bool:
    image = (
        db.query(LeadImage)
        .filter(LeadImage.lead_image_id == image_id, LeadImage.lead_id == lead_id)
        .first()
    )
    if not image:
        return False

    lead = image.lead
    image_path = image.image_url
    db.delete(image)
    db.commit()

    remove_upload(image_path)

    if lead:
        _sync_primary_lead_image(db, lead)

    return True


def attach_lead_image(db: Session, lead_id: int, upload: UploadFile) -> Optional[Lead]:  # backward-compatible
    created = add_lead_image(db, lead_id, upload)
    if not created:
        return None
    return get_lead_by_id(db, lead_id)


def remove_lead_image(db: Session, lead_id: int) -> Optional[Lead]:  # backward-compatible
    remaining = list_lead_images(db, lead_id)
    if not remaining:
        return get_lead_by_id(db, lead_id)
    deleted = delete_lead_image(db, lead_id, remaining[0].lead_image_id)
    if not deleted:
        return None
    return get_lead_by_id(db, lead_id)

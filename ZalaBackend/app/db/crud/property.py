from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy.exc import IntegrityError
from typing import Optional, List

from fastapi import HTTPException, status, UploadFile

from app.models.property import Property
from app.models.property_image import PropertyImage
from app.models.address import Address
from app.models.user import user_properties
from app.schemas.property import PropertyCreate, PropertyUpdate
from app.services.file_storage import save_upload_file, remove_upload


def create_property(db: Session, property_in: PropertyCreate, address_id: int, creator_id: int = None) -> Property:
    # Validate provided address_id exists
    db_address = db.query(Address).filter(Address.address_id == address_id).first()
    if not db_address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")

    db_property = Property(
        property_name=property_in.property_name,
        mls_number=property_in.mls_number,
        notes=property_in.notes,
        address_id=address_id,
        image_url=property_in.image_url,
    )
    db.add(db_property)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e.orig))

    db.refresh(db_property)

    # If creator_id provided, create association in user_properties table
    if creator_id is not None:
        try:
            # Use the association table to link the user and property
            db.execute(user_properties.insert().values(user_id=creator_id, property_id=db_property.property_id))
            db.commit()
        except Exception:
            # If association fails, roll back association but keep property creation
            db.rollback()

    return db_property


def get_properties(db: Session, address_id: int, skip: int = 0, limit: int = 100, creator_id: int = None) -> List[Property]:
    """Return properties for an address. If `creator_id` is provided, only return properties
    associated with that user (via `user_properties`). Eager-loads related objects to avoid N+1."""
    query = db.query(Property).options(
        joinedload(Property.address),
        joinedload(Property.units),
        joinedload(Property.users),
        selectinload(Property.images),
    )

    # scope to address
    query = query.filter(Property.address_id == address_id)

    # if creator_id passed, join the association table to filter by user
    if creator_id is not None:
        query = query.join(user_properties, user_properties.c.property_id == Property.property_id).filter(user_properties.c.user_id == creator_id)

    return query.offset(skip).limit(limit).all()


def get_property(db: Session, address_id: int, property_id: int) -> Optional[Property]:
    """Get single property scoped to address, eager-loading address and units."""
    return (
        db.query(Property)
        .options(
            joinedload(Property.address),
            joinedload(Property.units),
            joinedload(Property.users),
            selectinload(Property.images),
        )
        .filter(Property.property_id == property_id, Property.address_id == address_id)
        .first()
    )


def update_property(db: Session, address_id: int, property_id: int, property_in: PropertyUpdate):
    db_property = db.query(Property).filter(Property.property_id == property_id, Property.address_id == address_id).first()
    if not db_property:
        return None

    # Address association is managed by the path; do not change address_id here

    if property_in.property_name is not None:
        db_property.property_name = property_in.property_name
    if property_in.mls_number is not None:
        db_property.mls_number = property_in.mls_number
    if property_in.notes is not None:
        db_property.notes = property_in.notes
    if hasattr(property_in, "lead_id") and property_in.lead_id is not None:
        db_property.lead_id = property_in.lead_id
    if property_in.image_url is not None:
        db_property.image_url = property_in.image_url

    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e.orig))

    db.refresh(db_property)
    return db_property


def delete_property(db: Session, address_id: int, property_id: int):
    """Delete a property only if it belongs to the given address."""
    db_property = db.query(Property).filter(Property.property_id == property_id, Property.address_id == address_id).first()
    if not db_property:
        return None
    remove_upload(db_property.image_url)
    for image in list(getattr(db_property, "images", []) or []):
        remove_upload(image.image_url)
    db.delete(db_property)
    db.commit()
    return db_property


def _next_property_image_order(db: Session, property_id: int) -> int:
    current_max = (
        db.query(func.max(PropertyImage.sort_order))
        .filter(PropertyImage.property_id == property_id)
        .scalar()
    )
    return (current_max or 0) + 1


def list_property_images(db: Session, property_id: int) -> List[PropertyImage]:
    return (
        db.query(PropertyImage)
        .filter(PropertyImage.property_id == property_id)
        .order_by(PropertyImage.sort_order.asc(), PropertyImage.property_image_id.asc())
        .all()
    )


def add_property_image(
    db: Session,
    address_id: int,
    property_id: int,
    upload: UploadFile,
    caption: Optional[str] = None,
    sort_order: Optional[int] = None,
) -> Optional[PropertyImage]:
    db_property = (
        db.query(Property)
        .filter(Property.property_id == property_id, Property.address_id == address_id)
        .first()
    )
    if not db_property:
        return None

    new_path = save_upload_file(upload, "properties")
    effective_order = sort_order if sort_order is not None else _next_property_image_order(db, property_id)

    image = PropertyImage(
        property_id=property_id,
        image_url=new_path,
        caption=caption,
        sort_order=effective_order,
    )

    db.add(image)
    if not db_property.image_url:
        db_property.image_url = new_path
        db.add(db_property)

    db.commit()
    db.refresh(image)
    return image


def _sync_primary_property_image(db: Session, property_obj: Property) -> None:
    first_image = (
        db.query(PropertyImage)
        .filter(PropertyImage.property_id == property_obj.property_id)
        .order_by(PropertyImage.sort_order.asc(), PropertyImage.property_image_id.asc())
        .first()
    )
    property_obj.image_url = first_image.image_url if first_image else None
    db.add(property_obj)
    db.commit()
    db.refresh(property_obj)


def delete_property_image(db: Session, address_id: int, property_id: int, image_id: int) -> bool:
    image = (
        db.query(PropertyImage)
        .filter(
            PropertyImage.property_image_id == image_id,
            PropertyImage.property_id == property_id,
        )
        .first()
    )
    if not image:
        return False

    property_obj = image.property
    image_path = image.image_url
    db.delete(image)
    db.commit()

    remove_upload(image_path)

    if property_obj:
        _sync_primary_property_image(db, property_obj)

    return True


def attach_property_image(db: Session, address_id: int, property_id: int, upload: UploadFile) -> Optional[Property]:  # legacy
    created = add_property_image(db, address_id, property_id, upload)
    if not created:
        return None
    return get_property(db, address_id, property_id)


def remove_property_image(db: Session, address_id: int, property_id: int) -> Optional[Property]:  # legacy
    images = list_property_images(db, property_id)
    if not images:
        return get_property(db, address_id, property_id)
    deleted = delete_property_image(db, address_id, property_id, images[0].property_image_id)
    if not deleted:
        return None
    return get_property(db, address_id, property_id)

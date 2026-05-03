from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.hotel import Hotel
from schemas.hotel import HotelCreate
from auth.security import get_current_user
from models.user import RoleEnum

router = APIRouter(prefix="/hotels")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_hotel(data: HotelCreate, user=Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Admins only")

    hotel = Hotel(**data.model_dump())
    db.add(hotel)
    db.commit()
    return hotel

@router.get("/")
def get_hotels(db: Session = Depends(get_db)):
    return db.query(Hotel).all()


@router.get("/{hotel_id}")
def get_hotel(hotel_id: int, db: Session = Depends(get_db)):
    hotel = db.query(Hotel).filter(Hotel.hotel_id == hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel


@router.put("/{hotel_id}")
def update_hotel(hotel_id: int, data: HotelCreate, user=Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Admins only")

    hotel = db.query(Hotel).filter(Hotel.hotel_id == hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    for key, value in data.model_dump().items():
        setattr(hotel, key, value)

    db.commit()
    db.refresh(hotel)
    return hotel

@router.delete("/{hotel_id}")
def delete_hotel(hotel_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Admins only")

    hotel = db.query(Hotel).filter(Hotel.hotel_id == hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    db.delete(hotel)
    db.commit()
    return {"msg": "Hotel deleted"}
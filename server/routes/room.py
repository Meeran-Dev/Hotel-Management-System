from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.room import Room
from schemas.room import RoomCreate
from auth.security import get_current_user
from models.user import RoleEnum
from models.hotel_assignment import HotelAssignment

router = APIRouter(prefix="/rooms")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_room(data: RoomCreate, user=Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role not in [RoleEnum.ADMIN, RoleEnum.MANAGER]:
        raise HTTPException(status_code=403, detail="Not allowed")

    if user.role == RoleEnum.MANAGER:
        assignment = db.query(HotelAssignment).filter(
            HotelAssignment.user_id == user.user_id,
            HotelAssignment.hotel_id == data.hotel_id
        ).first()

        if not assignment:
            raise HTTPException(403, "Not assigned to this hotel")

    room = Room(**data.model_dump())
    db.add(room)
    db.commit()
    return room

@router.get("/{hotel_id}")
def get_rooms(hotel_id: int, db: Session = Depends(get_db)):
    return db.query(Room).filter(Room.hotel_id == hotel_id).all()

@router.put("/{room_id}")
def update_room(room_id: int, data: RoomCreate, user=Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role not in [RoleEnum.ADMIN, RoleEnum.MANAGER]:
        raise HTTPException(status_code=403, detail="Not allowed")

    room = db.query(Room).filter(Room.room_id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    for key, value in data.model_dump().items():
        setattr(room, key, value)

    db.commit()
    db.refresh(room)
    return room

@router.delete("/{room_id}")
def delete_room(room_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role not in [RoleEnum.ADMIN, RoleEnum.MANAGER]:
        raise HTTPException(status_code=403, detail="Not allowed")

    room = db.query(Room).filter(Room.room_id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    db.delete(room)
    db.commit()
    return {"msg": "Room deleted"}

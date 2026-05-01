from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.booking import Booking, BookingStatus
from models.room import Room, RoomStatus
from models.user import RoleEnum
from models.hotel_assignment import HotelAssignment
from models.cleaning_task import CleaningTask, CleaningTaskStatus
from schemas.booking import BookingCreate, BookingCheckIn, BookingCheckOut
from auth.security import get_current_user
from datetime import date, datetime

router = APIRouter(prefix="/booking")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def book_room(data: BookingCreate, db: Session = Depends(get_db)):
    if data.check_out_date <= data.check_in_date:
        raise HTTPException(status_code=400, detail="Invalid date range")

    if data.check_in_date < date.today():
        raise HTTPException(status_code=400, detail="Cannot book past dates")

    room = db.query(Room).filter(Room.room_id == data.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    existing = db.query(Booking).filter(
        Booking.room_id == data.room_id,
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN]),
        Booking.check_in_date <= data.check_out_date,
        Booking.check_out_date >= data.check_in_date
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Room already booked")

    nights = (data.check_out_date - data.check_in_date).days
    if nights <= 0:
        raise HTTPException(status_code=400, detail="Invalid nights calculation")

    booking = Booking(
        hotel_id=data.hotel_id,
        room_id=data.room_id,
        check_in_date=data.check_in_date,
        check_out_date=data.check_out_date,
        nights=nights,
        booked_by=data.booked_by,
        phone_num=data.phone_num,
        adult_guests=data.adult_guests,
        child_guests=data.child_guests,
        transaction_id=data.transaction_id,
        status=BookingStatus.CONFIRMED,
    )
    db.add(booking)
    room.status = RoomStatus.BOOKED
    db.commit()
    db.refresh(booking)
    return booking

@router.get("/my")
def my_bookings(user=Depends(get_current_user), db: Session = Depends(get_db)):
    # Since bookings don't have customer_id, return empty for now
    return []


@router.get("/hotel/{hotel_id}")
def hotel_bookings(hotel_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role not in [RoleEnum.MANAGER, RoleEnum.ADMIN]:
        raise HTTPException(status_code=403, detail="Not allowed")

    if user.role == RoleEnum.MANAGER:
        assignment = db.query(HotelAssignment).filter(
            HotelAssignment.user_id == user.user_id,
            HotelAssignment.hotel_id == hotel_id
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="Manager not assigned to this hotel")

    rows = db.query(Booking, Room).join(Room, Room.room_id == Booking.room_id).filter(Room.hotel_id == hotel_id).all()
    return [
        {
            "booking_id": b.booking_id,
            "hotel_id": b.hotel_id,
            "room_id": b.room_id,
            "room_num": r.room_num,
            "check_in_date": b.check_in_date,
            "check_out_date": b.check_out_date,
            "nights": b.nights,
            "booked_by": b.booked_by,
            "phone_num": b.phone_num,
            "adult_guests": b.adult_guests,
            "child_guests": b.child_guests,
            "transaction_id": b.transaction_id,
            "check_in_time": b.check_in_time,
            "check_out_time": b.check_out_time,
            "status": b.status,
        }
        for b, r in rows
    ]


@router.get("/available-rooms/{hotel_id}")
def available_rooms(hotel_id: int, check_in_date: date, check_out_date: date, db: Session = Depends(get_db)):
    if check_out_date <= check_in_date:
        raise HTTPException(status_code=400, detail="Invalid date range")

    room_list = db.query(Room).filter(Room.hotel_id == hotel_id).all()
    result = []

    for room in room_list:
        overlapping = db.query(Booking).filter(
            Booking.room_id == room.room_id,
            Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN]),
            Booking.check_in_date <= check_out_date,
            Booking.check_out_date >= check_in_date
        ).first()

        if not overlapping:
            result.append(room)

    return result


@router.post("/check-in")
def check_in_booking(data: BookingCheckIn, user=Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role not in [RoleEnum.MANAGER, RoleEnum.ADMIN]:
        raise HTTPException(status_code=403, detail="Not allowed")

    booking = db.query(Booking).filter(Booking.booking_id == data.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status != BookingStatus.CONFIRMED:
        raise HTTPException(status_code=400, detail="Only confirmed bookings can be checked in")

    if date.today() < booking.check_in_date:
        raise HTTPException(status_code=400, detail="Check-in is not allowed before check-in date")

    room = db.query(Room).filter(Room.room_id == booking.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    if user.role == RoleEnum.MANAGER:
        assignment = db.query(HotelAssignment).filter(
            HotelAssignment.user_id == user.user_id,
            HotelAssignment.hotel_id == room.hotel_id,
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="Manager not assigned to this hotel")

    booking.status = BookingStatus.CHECKED_IN
    booking.check_in_time = datetime.utcnow()
    room.status = RoomStatus.OCCUPIED
    db.commit()
    return {"msg": "Check-in successful"}


@router.post("/check-out")
def check_out_booking(data: BookingCheckOut, user=Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role not in [RoleEnum.MANAGER, RoleEnum.ADMIN]:
        raise HTTPException(status_code=403, detail="Not allowed")

    booking = db.query(Booking).filter(Booking.booking_id == data.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status != BookingStatus.CHECKED_IN:
        raise HTTPException(status_code=400, detail="Only checked-in bookings can be checked out")

    room = db.query(Room).filter(Room.room_id == booking.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    if user.role == RoleEnum.MANAGER:
        assignment = db.query(HotelAssignment).filter(
            HotelAssignment.user_id == user.user_id,
            HotelAssignment.hotel_id == room.hotel_id,
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="Manager not assigned to this hotel")

    booking.status = BookingStatus.COMPLETED
    booking.check_out_time = datetime.utcnow()
    room.status = RoomStatus.BOOKED

    task = CleaningTask(
        hotel_id=room.hotel_id,
        room_id=room.room_id,
        status=CleaningTaskStatus.PENDING
    )
    db.add(task)
    db.commit()
    return {"msg": "Check-out successful. Cleaning task created."}

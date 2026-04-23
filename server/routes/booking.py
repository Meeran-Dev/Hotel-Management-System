from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.booking import Booking, BookingStatus
from models.room import Room, RoomStatus
from models.user import RoleEnum
from models.manager_hotel import ManagerHotel
from models.housekeeping_task import HousekeepingTask, HousekeepingTaskStatus
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
def book_room(data: BookingCreate, user=Depends(get_current_user), db: Session = Depends(get_db)):
    if data.check_out_date <= data.check_in_date:
        raise HTTPException(status_code=400, detail="Invalid date range")

    if data.check_in_date < date.today():
        raise HTTPException(status_code=400, detail="Cannot book past dates")

    room = db.query(Room).filter(Room.room_id == data.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    if user.role not in [RoleEnum.MANAGER, RoleEnum.ADMIN]:
        raise HTTPException(status_code=403, detail="Only managers/admins can create bookings")

    if user.role == RoleEnum.MANAGER:
        assignment = db.query(ManagerHotel).filter(
            ManagerHotel.manager_id == user.user_id,
            ManagerHotel.hotel_id == room.hotel_id
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="Manager not assigned to this hotel")

    existing = db.query(Booking).filter(
        Booking.room_id == data.room_id,
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN]),
        Booking.check_in_date <= data.check_out_date,
        Booking.check_out_date >= data.check_in_date
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Room already booked")

    payment_method = (data.payment_method or "").upper()
    if payment_method not in ["UPI", "CASH"]:
        raise HTTPException(status_code=400, detail="payment_method must be UPI or CASH")

    if payment_method == "UPI" and not (data.transaction_id or "").strip():
        raise HTTPException(status_code=400, detail="Transaction ID required for UPI payments")

    nights = (data.check_out_date - data.check_in_date).days
    if nights <= 0:
        raise HTTPException(status_code=400, detail="Invalid nights calculation")

    total_amount = float(room.price) * nights

    booking = Booking(
        customer_id=user.user_id,
        manager_id=user.user_id,
        room_id=data.room_id,
        check_in_date=data.check_in_date,
        check_out_date=data.check_out_date,
        nights=nights,
        total_amount=total_amount,
        customer_name=data.customer_name,
        customer_mobile=data.customer_mobile,
        customer_age=data.customer_age,
        guest_count=max(1, data.guest_count or 1),
        payment_method=payment_method,
        transaction_id=(data.transaction_id or None),
        status=BookingStatus.CONFIRMED
    )
    db.add(booking)
    room.status = RoomStatus.BOOKED
    db.commit()
    db.refresh(booking)
    return booking

@router.get("/my")
def my_bookings(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Booking).filter(Booking.customer_id == user.user_id).all()


@router.get("/hotel/{hotel_id}")
def hotel_bookings(hotel_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role not in [RoleEnum.MANAGER, RoleEnum.ADMIN]:
        raise HTTPException(status_code=403, detail="Not allowed")

    if user.role == RoleEnum.MANAGER:
        assignment = db.query(ManagerHotel).filter(
            ManagerHotel.manager_id == user.user_id,
            ManagerHotel.hotel_id == hotel_id
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="Manager not assigned to this hotel")

    rows = db.query(Booking, Room).join(Room, Room.room_id == Booking.room_id).filter(Room.hotel_id == hotel_id).all()
    return [
        {
            "booking_id": b.booking_id,
            "room_id": b.room_id,
            "room_number": r.room_number,
            "check_in_date": b.check_in_date,
            "check_out_date": b.check_out_date,
            "nights": b.nights,
            "total_amount": float(b.total_amount),
            "customer_name": b.customer_name,
            "customer_mobile": b.customer_mobile,
            "customer_age": b.customer_age,
            "guest_count": b.guest_count,
            "payment_method": b.payment_method,
            "transaction_id": b.transaction_id,
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

    booking.status = BookingStatus.CHECKED_IN
    booking.checked_in_at = datetime.utcnow()
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

    booking.status = BookingStatus.COMPLETED
    booking.checked_out_at = datetime.utcnow()
    room.status = RoomStatus.CLEANING

    task = HousekeepingTask(
        hotel_id=room.hotel_id,
        room_id=room.room_id,
        booking_id=booking.booking_id,
        status=HousekeepingTaskStatus.PENDING
    )
    db.add(task)
    db.commit()
    return {"msg": "Check-out successful. Housekeeping task created."}

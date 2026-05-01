from pydantic import BaseModel
from datetime import date

class BookingCreate(BaseModel):
    hotel_id: int
    room_id: int
    check_in_date: date
    check_out_date: date
    booked_by: str
    phone_num: str
    adult_guests: int
    child_guests: int
    transaction_id: str | None = None


class BookingCheckIn(BaseModel):
    booking_id: int


class BookingCheckOut(BaseModel):
    booking_id: int
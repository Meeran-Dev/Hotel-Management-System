from pydantic import BaseModel
from datetime import date

class BookingCreate(BaseModel):
    room_id: int
    check_in_date: date
    check_out_date: date
    customer_name: str
    customer_mobile: str
    customer_age: int
    guest_count: int = 1
    payment_method: str
    transaction_id: str | None = None


class BookingCheckIn(BaseModel):
    booking_id: int


class BookingCheckOut(BaseModel):
    booking_id: int
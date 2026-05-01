from sqlalchemy import Column, Integer, ForeignKey, Date, Enum, String, DateTime
from database import Base
import enum

class BookingStatus(str, enum.Enum):
    CANCELLED = "CANCELLED"
    CONFIRMED = "CONFIRMED"
    CHECKED_IN = "CHECKED_IN"
    COMPLETED = "COMPLETED"

class Booking(Base):
    __tablename__ = "bookings"
    booking_id = Column(Integer, primary_key=True, autoincrement=True)
    hotel_id = Column(Integer, ForeignKey("hotels.hotel_id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.room_id"), nullable=False)
    check_in_date = Column(Date, nullable=False)
    check_out_date = Column(Date, nullable=False)
    nights = Column(Integer)
    booked_by = Column(String(255))
    phone_num = Column(String(20))
    adult_guests = Column(Integer, default=1)
    child_guests = Column(Integer, default=0)
    transaction_id = Column(String(255))
    check_in_time = Column(DateTime)
    check_out_time = Column(DateTime)
    status = Column(Enum(BookingStatus), default=BookingStatus.CONFIRMED)
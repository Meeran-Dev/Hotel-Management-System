from sqlalchemy import Column, Integer, BigInteger, ForeignKey, Date, Enum, String, DECIMAL, DateTime
from database import Base
import enum
from datetime import datetime

class BookingStatus(str, enum.Enum):
    CONFIRMED = "CONFIRMED"
    CHECKED_IN = "CHECKED_IN"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"

class Booking(Base):
    __tablename__ = "bookings"
    booking_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(BigInteger, ForeignKey("User.user_id"))
    room_id = Column(Integer, ForeignKey("rooms.room_id"))
    manager_id = Column(BigInteger)
    check_in_date = Column(Date)
    check_out_date = Column(Date)
    nights = Column(Integer, nullable=False, default=1)
    total_amount = Column(DECIMAL(10, 2), nullable=False, default=0)
    customer_name = Column(String(255), nullable=False, default="")
    customer_mobile = Column(String(30), nullable=False, default="")
    customer_age = Column(Integer, nullable=False, default=18)
    guest_count = Column(Integer, nullable=False, default=1)
    payment_method = Column(String(20), nullable=False, default="CASH")
    transaction_id = Column(String(100), nullable=True)
    checked_in_at = Column(DateTime, nullable=True)
    checked_out_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    status = Column(Enum(BookingStatus), default=BookingStatus.CONFIRMED)
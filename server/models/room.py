from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DECIMAL
from database import Base
import enum

class RoomType(str, enum.Enum):
    STANDARD = "STANDARD"
    DELUXE = "DELUXE"
    SUITE = "SUITE"

class RoomStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    BOOKED = "BOOKED"
    OCCUPIED = "OCCUPIED"
    CLEANING_NEEDED = "CLEANING_NEEDED"

class Room(Base):
    __tablename__ = "rooms"
    room_id = Column(Integer, primary_key=True, autoincrement=True)
    hotel_id = Column(Integer, ForeignKey("hotels.hotel_id"), nullable=False)
    room_num = Column(String(50), nullable=False)
    type = Column(Enum(RoomType), nullable=False)
    price_per_night = Column(DECIMAL(10,2), nullable=False)
    status = Column(Enum(RoomStatus), default=RoomStatus.AVAILABLE)
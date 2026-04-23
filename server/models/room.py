from sqlalchemy import Column, Integer, String, BigInteger, ForeignKey, Enum, DECIMAL
from database import Base
import enum

class RoomStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    BOOKED = "BOOKED"
    OCCUPIED = "OCCUPIED"
    CLEANING = "CLEANING"

class Room(Base):
    __tablename__ = "rooms"
    room_id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(BigInteger, ForeignKey("Hotels.hotel_id"))
    room_number = Column(Integer)
    type = Column(String(50))
    price = Column(DECIMAL(10,2))
    status = Column(Enum(RoomStatus), default=RoomStatus.AVAILABLE)
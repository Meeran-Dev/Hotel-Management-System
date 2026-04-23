from sqlalchemy import Column, Integer, BigInteger, ForeignKey, DateTime, Enum
from database import Base
import enum
from datetime import datetime


class HousekeepingTaskStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"


class HousekeepingTask(Base):
    __tablename__ = "housekeeping_tasks"
    task_id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(BigInteger, nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.room_id"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.booking_id"), nullable=False)
    status = Column(Enum(HousekeepingTaskStatus), default=HousekeepingTaskStatus.PENDING, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

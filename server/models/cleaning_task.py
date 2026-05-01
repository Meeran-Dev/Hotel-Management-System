from sqlalchemy import Column, Integer, ForeignKey, String, Enum, Text
from database import Base
import enum

class CleaningTaskStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"

class CleaningTask(Base):
    __tablename__ = "cleaning_tasks"
    task_id = Column(Integer, primary_key=True, autoincrement=True)
    hotel_id = Column(Integer, ForeignKey("hotels.hotel_id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.room_id"), nullable=False)
    notes = Column(Text)
    status = Column(Enum(CleaningTaskStatus), default=CleaningTaskStatus.PENDING)

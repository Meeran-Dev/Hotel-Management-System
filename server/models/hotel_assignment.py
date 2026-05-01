from sqlalchemy import Column, Integer, ForeignKey
from database import Base

class HotelAssignment(Base):
    __tablename__ = "hotel_assignment"
    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    hotel_id = Column(Integer, ForeignKey("hotels.hotel_id"), primary_key=True)
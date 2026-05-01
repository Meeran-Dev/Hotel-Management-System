from sqlalchemy import Column, String, Integer
from database import Base

class Hotel(Base):
    __tablename__ = "hotels"
    hotel_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    city = Column(String(100))
    state = Column(String(100))
    num_rooms = Column(Integer, default=0)
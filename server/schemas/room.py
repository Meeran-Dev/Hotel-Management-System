from pydantic import BaseModel
from models.room import RoomType

class RoomCreate(BaseModel):
    hotel_id: int
    room_num: str
    type: RoomType
    price_per_night: float
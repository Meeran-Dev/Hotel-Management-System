from pydantic import BaseModel

class HotelCreate(BaseModel):
    name: str
    city: str
    state: str
    num_rooms: int
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from database import SessionLocal
from auth.security import get_current_user
from models.user import RoleEnum
from models.cleaning_task import CleaningTask, CleaningTaskStatus
from models.room import Room, RoomStatus

router = APIRouter(prefix="/housekeeping")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/tasks")
def get_tasks(user=Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role not in [RoleEnum.ADMIN, RoleEnum.MANAGER]:
        # Housekeeping users are treated as non-admin/non-manager in existing enum setup.
        # Keep access open to authenticated users for housekeeping dashboard.
        pass

    tasks = db.query(CleaningTask, Room).join(Room, Room.room_id == CleaningTask.room_id).filter(
        CleaningTask.status == CleaningTaskStatus.PENDING
    ).all()

    return [
        {
            "task_id": task.task_id,
            "hotel_id": task.hotel_id,
            "room_id": task.room_id,
            "notes": task.notes,
            "status": task.status,
            "room_num": room.room_num,
            "room_type": room.type,
        }
        for task, room in tasks
    ]


@router.post("/tasks/{task_id}/complete")
def complete_task(task_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role not in [RoleEnum.ADMIN, RoleEnum.MANAGER]:
        # Housekeeping users are treated as non-admin/non-manager in existing enum setup.
        # Keep access open to authenticated users for housekeeping dashboard.
        pass

    task = db.query(CleaningTask).filter(CleaningTask.task_id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.status == CleaningTaskStatus.COMPLETED:
        return {"msg": "Task already completed"}

    room = db.query(Room).filter(Room.room_id == task.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    task.status = CleaningTaskStatus.COMPLETED
    room.status = RoomStatus.AVAILABLE
    db.commit()
    return {"msg": "Room marked as cleaned and available"}

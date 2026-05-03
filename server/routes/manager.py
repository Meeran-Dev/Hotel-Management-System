from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.hotel_assignment import HotelAssignment
from models.user import RoleEnum, User
from auth.security import get_current_user
from auth.security import hash_password
from schemas.user import UserCreate

router = APIRouter(prefix="/manager")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/managers")
def list_managers(user=Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Admins only")

    unassigned_managers = (
        db.query(User)
        .filter(
            User.role == RoleEnum.MANAGER,
            ~db.query(HotelAssignment)
            .filter(HotelAssignment.user_id == User.user_id)
            .exists(),
        )
        .order_by(User.name.asc())
        .all()
    )
    return [
        {"user_id": m.user_id, "name": m.name, "email": m.email} for m in unassigned_managers
    ]


@router.post("/assign")
def assign_manager(manager_id: int, hotel_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    # Only admin can assign
    if user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Admins only")

    manager_row = db.query(User).filter(User.user_id == manager_id).first()
    if not manager_row or manager_row.role != RoleEnum.MANAGER:
        raise HTTPException(status_code=404, detail="Manager not found")

    existing = db.query(HotelAssignment).filter(
        HotelAssignment.user_id == manager_id,
        HotelAssignment.hotel_id == hotel_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already assigned")

    assignment = HotelAssignment(user_id=manager_id, hotel_id=hotel_id)
    db.add(assignment)
    db.commit()
    return {"msg": "Manager assigned"}

@router.get("/my-hotels")
def get_my_hotels(user=Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != RoleEnum.MANAGER:
        raise HTTPException(status_code=403, detail="Managers only")

    return db.query(HotelAssignment).filter(HotelAssignment.user_id == user.user_id).all()

@router.get("/staff/{hotel_id}")
def get_hotel_staff(hotel_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role not in [RoleEnum.MANAGER, RoleEnum.ADMIN]:
        raise HTTPException(status_code=403, detail="Not allowed")

    if user.role == RoleEnum.MANAGER:
        assignment = db.query(HotelAssignment).filter(
            HotelAssignment.user_id == user.user_id,
            HotelAssignment.hotel_id == hotel_id
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="Not assigned to this hotel")

    staff_assignments = db.query(HotelAssignment).filter(HotelAssignment.hotel_id == hotel_id).all()
    staff_ids = [a.user_id for a in staff_assignments]
    staff = db.query(User).filter(User.user_id.in_(staff_ids), User.role == RoleEnum.STAFF).all()
    return staff


@router.post("/staff/{hotel_id}")
def create_staff_for_hotel(
    hotel_id: int,
    payload: UserCreate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.role != RoleEnum.STAFF:
        raise HTTPException(status_code=400, detail="Only STAFF role is allowed")

    if user.role not in [RoleEnum.MANAGER, RoleEnum.ADMIN]:
        raise HTTPException(status_code=403, detail="Not allowed")

    if user.role == RoleEnum.MANAGER:
        manager_assignment = db.query(HotelAssignment).filter(
            HotelAssignment.user_id == user.user_id,
            HotelAssignment.hotel_id == hotel_id,
        ).first()
        if not manager_assignment:
            raise HTTPException(status_code=403, detail="Not assigned to this hotel")

    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email exists")

    new_staff = User(
        name=payload.name,
        email=payload.email,
        password=hash_password(payload.password),
        role=RoleEnum.STAFF,
    )
    db.add(new_staff)
    db.flush()

    assignment = HotelAssignment(user_id=new_staff.user_id, hotel_id=hotel_id)
    db.add(assignment)
    db.commit()
    db.refresh(new_staff)
    return {
        "msg": "Staff created and assigned",
        "user_id": new_staff.user_id,
        "hotel_id": hotel_id,
    }

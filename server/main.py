from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, hotel, room, booking, manager, housekeeping
from database import ensure_runtime_schema

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(hotel.router)
app.include_router(room.router)
app.include_router(booking.router)
app.include_router(manager.router)
app.include_router(housekeeping.router)


@app.on_event("startup")
def run_startup_migrations():
    ensure_runtime_schema()

from sqlalchemy import create_engine
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from pathlib import Path
from dotenv import load_dotenv

_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_env_path, override=True)

def _read_database_url_fallback():
    try:
        # utf-8-sig safely strips BOM if present (common on Windows)
        text = _env_path.read_text(encoding="utf-8-sig")
    except OSError:
        return None

    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if not line.startswith("DATABASE_URL="):
            continue
        value = line.split("=", 1)[1].strip()
        if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
            value = value[1:-1]
        return value or None
    return None


_fallback_url = _read_database_url_fallback()
if _fallback_url and not os.getenv("DATABASE_URL"):
    os.environ["DATABASE_URL"] = _fallback_url

DATABASE_URL = os.getenv("DATABASE_URL") or _fallback_url or "mysql+pymysql://root:password@localhost/hotel_db"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


def ensure_runtime_schema():
    statements = [
        """
        ALTER TABLE bookings
        ADD COLUMN nights INT NOT NULL DEFAULT 1
        """,
        """
        ALTER TABLE bookings
        ADD COLUMN total_amount DECIMAL(10,2) NOT NULL DEFAULT 0
        """,
        """
        ALTER TABLE bookings
        ADD COLUMN customer_name VARCHAR(255) NOT NULL DEFAULT ''
        """,
        """
        ALTER TABLE bookings
        ADD COLUMN customer_mobile VARCHAR(30) NOT NULL DEFAULT ''
        """,
        """
        ALTER TABLE bookings
        ADD COLUMN customer_age INT NOT NULL DEFAULT 18
        """,
        """
        ALTER TABLE bookings
        ADD COLUMN guest_count INT NOT NULL DEFAULT 1
        """,
        """
        ALTER TABLE bookings
        ADD COLUMN payment_method VARCHAR(20) NOT NULL DEFAULT 'CASH'
        """,
        """
        ALTER TABLE bookings
        ADD COLUMN transaction_id VARCHAR(100) NULL
        """,
        """
        ALTER TABLE bookings
        ADD COLUMN checked_in_at DATETIME NULL
        """,
        """
        ALTER TABLE bookings
        ADD COLUMN checked_out_at DATETIME NULL
        """,
        """
        ALTER TABLE bookings
        ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        """,
        """
        ALTER TABLE bookings
        MODIFY COLUMN status ENUM('CONFIRMED','CHECKED_IN','CANCELLED','COMPLETED') DEFAULT 'CONFIRMED'
        """,
        """
        ALTER TABLE rooms
        MODIFY COLUMN status ENUM('AVAILABLE','BOOKED','OCCUPIED','CLEANING') DEFAULT 'AVAILABLE'
        """,
        """
        CREATE TABLE housekeeping_tasks (
            task_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            hotel_id BIGINT NOT NULL,
            room_id INT NOT NULL,
            booking_id INT NOT NULL,
            status ENUM('PENDING','COMPLETED') NOT NULL DEFAULT 'PENDING',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME NULL,
            INDEX ix_housekeeping_tasks_task_id (task_id),
            CONSTRAINT fk_housekeeping_room FOREIGN KEY (room_id) REFERENCES rooms(room_id),
            CONSTRAINT fk_housekeeping_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
        )
        """,
    ]

    with engine.begin() as conn:
        for statement in statements:
            try:
                conn.execute(text(statement))
            except Exception:
                # This is a lightweight idempotent upgrader for the local dev schema.
                # Existing columns/tables or equivalent enum states can safely be skipped.
                pass

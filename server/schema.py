from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    with open("schema.sql", "r") as f:
        sql = f.read()

    for statement in sql.split(";"):
        if statement.strip():
            conn.execute(text(statement))

    conn.commit()
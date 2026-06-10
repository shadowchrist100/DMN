import uuid
from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import date

class Patient(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory = uuid.uuid4,
        primary_key = True,
    )
    user_id: str
    death_date: date
    multiple_birth: bool | int

import uuid
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date
from app.types.enums import Perimeter, Duration


class Consent(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True
    )
    perimeter: Perimeter
    granted_at: date
    expire_at: date
    duration: Duration
    is_actif: bool
    is_urgence: bool

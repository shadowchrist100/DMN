import uuid
from sqlmodel import SQLModel,Field
from typing import Optional
from enum import Enum
from datetime import date

class Perimeter(str, Enum):
    ALL = "all"
    PRESCRIPTIONS = "prescriptions"

class Duration(str, Enum):
    MIN_30 = "30min"
    H_1 = "1h"


class Consents(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory = uuid.uuid4,
        primary_key = True
    )
    perimeter: Perimeter
    granted_at: date
    expire_at: date
    duration: Duration
    is_actif: bool
    is_urgence: bool

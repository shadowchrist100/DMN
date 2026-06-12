import uuid
from sqlmodel import SQLModel,Field
from typing import Optional
from enum import Enum
from datetime import date

class Immunisation(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    statut_injection: str
    dose_sequence: int
    date_administration: date
    numero_lot: str
    prochain_rappel: Optional[date] = None
    note: Optional[str] = None
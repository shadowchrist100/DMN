import uuid
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date


class Diagnosis(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    statut_verification: str
    date_statut: date
    note_clinique: Optional[str] = None
    statut_clinique: str

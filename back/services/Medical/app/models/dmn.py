import uuid
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional
from datetime import date


class DMN(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    patient_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="patient.id"
    )
    date_creation: date
    blood_type: Optional[str] = None
    rhesus_factor: Optional[str] = None

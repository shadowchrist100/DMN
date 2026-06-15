import uuid
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime


class DMN(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    date_creation: datetime = Field(default_factory=datetime.now())
    blood_type: Optional[str] = None
    rhesus_factor: Optional[str] = None
    patient_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="patient.id"
    )

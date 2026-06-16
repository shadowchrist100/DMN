import uuid
from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import date


class CareEpisode(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    clinical_status: str
    severity: str
    start_date: date
    end_date: date
    diagnosis_id : Optional[uuid.UUID] = Field(default=None, foreign_key="diagnosis.id", unique=True)
    diagnosis: Optional["Diagnosis"] = Relationship(back_populates="care_episode")
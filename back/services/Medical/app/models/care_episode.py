from typing import Optional, List, TYPE_CHECKING
import uuid
from sqlmodel import Field, SQLModel, Relationship
from datetime import date

if TYPE_CHECKING:
    from .diagnosis import Diagnosis
    from .medical_act import MedicalAct


class CareEpisode(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    clinical_status: str
    severity: str
    start_date: date
    end_date: Optional[date] = None

    diagnosis_id: Optional[uuid.UUID] = Field(default=None, foreign_key="diagnosis.id")
    diagnosis: Optional["Diagnosis"] = Relationship(back_populates="care_episodes")

    medical_acts: List["MedicalAct"] = Relationship(back_populates="care_episode")

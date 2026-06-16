import uuid
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import date
from app.types.enums import DiagnosisVerification

if TYPE_CHECKING:
    from .medical_act import MedicalAct
    from .diagnosis_reference import DiagnosisReference
    from .care_episode import CareEpisode
    from .prescription import Prescription


class Diagnosis(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    statut_verification: DiagnosisVerification
    date: date = Field(default_factory=date.today)
    note_clinique: Optional[str] = None

    medical_act_id: Optional[uuid.UUID] = Field(
        default=None,
        foreign_key="medical_act.id",
    )
    diagnosis_ref_id: Optional[uuid.UUID] = Field(
        default=None,
        foreign_key="diagnosis_reference.id",
    )

    type: str
    __mapper_args__ = {
        "polymorphic_on": "type",
        "polymorphic_identity": "standard"
    }

    medical_act: Optional["MedicalAct"] = Relationship(back_populates="diagnoses")
    diagnosis_ref: Optional["DiagnosisReference"] = Relationship(back_populates="diagnoses")
    care_episode: Optional["CareEpisode"] = Relationship(
        back_populates="diagnosis",
        sa_relationship_kwargs={"uselist": False}
    )

    prescriptions: List["Prescription"] = Relationship(back_populates="diagnosis")

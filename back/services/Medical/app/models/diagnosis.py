import uuid
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import date
from app.types.enums import DiagnosisVerification


class Diagnosis(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    statut_verification: DiagnosisVerification
    date: date = Field(default_factory=date.today)
    note_clinique: Optional[str] = None

    mediacal_act_id: Optional[uuid.UUID] = Field(
        default = None,    
        foreign_key="medicalacts.id",
    )
    diagnosis_ref_id: Optional[uuid.UUID] = Field(
        default = None,
        foreign_key = "diagnosisref.id",
    )

    type: str
    __mapper_args__ = {
        "polymorphic_on": "type",
        "polymorphic_identity": "standard"
    }

    medical_act: MedicalActs = Relationship(back_populates = "diagnoses" )
    diagnosis_ref: Optional[DiagnosisRef] = Relationship (back_populates = "diagnoses")
    care_episode: Optional["CareEpisode"] = Relationship (
        back_populates="diagnosis",
        sa_relationship_kwargs={"uselist": False}
    )
    
    # Un diagnostic engendre plusieurs prescriptions (Examens, Vaccins)
    prescriptions: List["Prescription"] = Relationship(back_populates="diagnosis")

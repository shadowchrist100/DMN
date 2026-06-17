import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import Column, UUID, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.base import Base


class Diagnosis(Base):
    __tablename__ = "diagnosis"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    statut_verification = Column(String, nullable=False)
    date_diagnosis = Column("date", Date, nullable=False)
    note_clinique = Column(String, nullable=True)
    medical_act_id = Column(UUID, ForeignKey("medicalact.id"), nullable=True)
    diagnosis_ref_id = Column(UUID, ForeignKey("diagnosisreference.id"), nullable=True)
    type_diagnosis = Column("type", String, nullable=False)

    __mapper_args__ = {
        "polymorphic_on": "type_diagnosis",
        "polymorphic_identity": "standard"
    }

    medical_act = relationship("MedicalAct", back_populates="diagnoses")

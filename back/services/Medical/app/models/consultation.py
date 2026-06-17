from typing import Optional
from sqlalchemy import Column, UUID, Integer, String, ForeignKey
from app.models.medical_act import MedicalAct


class Consultation(MedicalAct):
    __tablename__ = "consultation"

    id = Column(UUID, ForeignKey("medicalact.id"), primary_key=True)
    duree_minutes = Column(Integer, nullable=True)
    motif = Column(String, nullable=True)

    __mapper_args__ = {
        "polymorphic_identity": "Consultation",
    }

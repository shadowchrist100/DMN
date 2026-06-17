from typing import Optional
from sqlalchemy import Column, UUID, String, Integer, Date, Text, ForeignKey
from app.models.medical_act import MedicalAct


class Vaccination(MedicalAct):
    __tablename__ = "vaccination"

    id = Column(UUID, ForeignKey("medicalact.id"), primary_key=True)
    injection_site = Column(String, nullable=True)
    sequence_dose = Column(Integer, nullable=True)
    batch_number = Column(String, nullable=True)
    next_reminder = Column(Date, nullable=True)
    note = Column(Text, nullable=True)

    __mapper_args__ = {
        "polymorphic_identity": "VACCINATION",
    }

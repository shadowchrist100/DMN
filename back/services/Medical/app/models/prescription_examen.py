import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import Column, UUID, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.base import Base


class PrescriptionExamen(Base):
    __tablename__ = "prescriptionexamen"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    date_prescription = Column(DateTime, nullable=False, default=datetime.now)
    statut = Column(String, nullable=False)
    special_instructions = Column(String, nullable=False, default="")
    medical_act_id = Column(UUID, ForeignKey("medicalact.id"), nullable=False)
    type_prescription = Column("type", String, nullable=False)

    __mapper_args__ = {
        "polymorphic_on": "type_prescription",
        "polymorphic_identity": "prescription_examen_base"
    }

    medical_act = relationship("MedicalAct", back_populates="prescriptions_examens")

from typing import Optional, TYPE_CHECKING
from sqlalchemy import Column, UUID, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.models.medical_act import MedicalAct

if TYPE_CHECKING:
    from .diagnostic_evidence import DiagnosticEvidence


class ExaminationAct(MedicalAct):
    __tablename__ = "examinationact"

    id = Column(UUID, ForeignKey("medicalact.id"), primary_key=True)
    prescription_examen_id = Column(UUID, ForeignKey("prescriptionexamen.id"), nullable=True)
    code_loinc = Column(String, nullable=False)
    libelle_examen = Column(String, nullable=False)
    type_examen = Column(String, nullable=False)
    value = Column(String, nullable=False)
    interpretation = Column(String, nullable=False)
    image_path = Column(Text, nullable=True)

    diagnostic_evidences = relationship("DiagnosticEvidence", back_populates="examination_act")

    __mapper_args__ = {
        "polymorphic_identity": "Examen",
    }

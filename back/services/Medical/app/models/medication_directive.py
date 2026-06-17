from typing import Optional, TYPE_CHECKING
from sqlalchemy import Column, UUID, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.models.prescription_directive import PrescriptionDirective

if TYPE_CHECKING:
    from .medication_reference import MedicationReference


class MedicationDirective(PrescriptionDirective):
    __tablename__ = "medicationdirective"

    id = Column(UUID, ForeignKey("prescriptiondirective.id"), primary_key=True)
    medication_ref_id = Column(UUID, ForeignKey("medicationreference.id"), nullable=False)
    posologie = Column(String, nullable=False)
    duree_jours = Column(Integer, nullable=False)

    medication_ref = relationship("MedicationReference", back_populates="medication_directives")

    __mapper_args__ = {"polymorphic_identity": "medicament"}

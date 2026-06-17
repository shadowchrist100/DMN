from sqlalchemy import Column, UUID, String, Integer, ForeignKey
from app.models.prescription_directive import PrescriptionDirective


class MedicationDirective(PrescriptionDirective):
    __tablename__ = "medicationdirective"

    id = Column(UUID, ForeignKey("prescriptiondirective.id"), primary_key=True)
    medication_ref_id = Column(UUID, ForeignKey("medicationreference.id"), nullable=False)
    posologie = Column(String, nullable=False)
    duree_jours = Column(Integer, nullable=False)

    __mapper_args__ = {"polymorphic_identity": "medicament"}

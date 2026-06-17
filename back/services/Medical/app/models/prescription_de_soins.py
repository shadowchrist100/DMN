from typing import Optional
from sqlalchemy import Column, UUID, String, Integer, ForeignKey
from app.models.prescription_directive import PrescriptionDirective


class PrescriptionDeSoins(PrescriptionDirective):
    __tablename__ = "prescriptiondesoins"

    id = Column(UUID, ForeignKey("prescriptiondirective.id"), primary_key=True)
    sous_type = Column(String, nullable=False)
    nombre_seances = Column(Integer, nullable=True)
    frequence_hebdo = Column(String, nullable=True)
    objectifs = Column(String, nullable=True)
    titre_consigne = Column(String, nullable=True)
    recommandations = Column(String, nullable=True)

    __mapper_args__ = {"polymorphic_identity": "soins"}

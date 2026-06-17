from sqlalchemy import Column, UUID, String, ForeignKey
from app.models.prescription_examen import PrescriptionExamen


class Vaccine(PrescriptionExamen):
    __tablename__ = "vaccine"

    id = Column(UUID, ForeignKey("prescriptionexamen.id"), primary_key=True)
    code_cvx = Column(String, nullable=False)
    libelle = Column(String, nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": "vaccin",
    }

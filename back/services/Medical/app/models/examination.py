from sqlalchemy import Column, UUID, String, ForeignKey
from app.models.prescription_examen import PrescriptionExamen


class Examination(PrescriptionExamen):
    __tablename__ = "examination"

    id = Column(UUID, ForeignKey("prescriptionexamen.id"), primary_key=True)
    code_loinc = Column(String, nullable=False)
    libelle = Column(String, nullable=False)
    nature_examination = Column(String, nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": "examination",
    }

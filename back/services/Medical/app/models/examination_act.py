from typing import Optional
from sqlalchemy import Column, UUID, ForeignKey, String, Text
from app.base import Base


class ExaminationAct(Base):
    __tablename__ = "examinationact"

    id = Column(UUID, ForeignKey("medicalact.id"), primary_key=True)
    code_loinc = Column(String, nullable=False)
    libelle_examen = Column(String, nullable=False)
    type_examen = Column(String, nullable=False)
    value = Column(String, nullable=False)
    interpretation = Column(String, nullable=False)
    image_path = Column(Text, nullable=True)

    __mapper_args__ = {
        "polymorphic_identity": "TypeActe.EXAMEN",
    }

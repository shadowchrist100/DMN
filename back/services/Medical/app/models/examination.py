from sqlalchemy import Column, UUID, ForeignKey, String
from app.base import Base


class Examination(Base):
    __tablename__ = "examination"

    id = Column(UUID, ForeignKey("prescription.id"), primary_key=True)
    code_loinc = Column(String, nullable=False)
    libelle = Column(String, nullable=False)
    nature_examination = Column(String, nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": "examination",
    }

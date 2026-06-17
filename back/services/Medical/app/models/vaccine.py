from sqlalchemy import Column, UUID, ForeignKey, String
from app.base import Base


class Vaccine(Base):
    __tablename__ = "vaccine"

    id = Column(UUID, ForeignKey("prescription.id"), primary_key=True)
    code_cvx = Column(String, nullable=False)
    libelle = Column(String, nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": "vaccin",
    }

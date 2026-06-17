from sqlalchemy import Column, UUID, ForeignKey, String, Integer
from app.base import Base


class SessionDirective(Base):
    __tablename__ = "sessiondirective"

    id = Column(UUID, ForeignKey("prescriptiondirective.id"), primary_key=True)
    nombre_seances = Column(Integer, nullable=False)
    frequence_hebdo = Column(String, nullable=False)
    objectifs_specifiques = Column(String, nullable=False)

    __mapper_args__ = {"polymorphic_identity": "soins_reed_kine"}

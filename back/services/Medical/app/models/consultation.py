from typing import Optional
from sqlalchemy import Column, UUID, ForeignKey, Integer
from app.base import Base


class Consultation(Base):
    __tablename__ = "consultation"

    id = Column(UUID, ForeignKey("medicalact.id"), primary_key=True)
    duree_minutes = Column(Integer, nullable=True)

    __mapper_args__ = {
        "polymorphic_identity": "TypeActe.CONSULTATION",
    }

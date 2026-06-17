from sqlalchemy import Column, UUID, ForeignKey
from app.base import Base


class Disease(Base):
    __tablename__ = "disease"

    id = Column(UUID, ForeignKey("diagnosis.id"), primary_key=True)

    __mapper_args__ = {
        "polymorphic_identity": "disease",
    }

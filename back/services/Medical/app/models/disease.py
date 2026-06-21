from sqlalchemy import Column, UUID, ForeignKey
from app.models.diagnosis import Diagnosis


class Disease(Diagnosis):
    __tablename__ = None

    __mapper_args__ = {
        "polymorphic_identity": "disease",
    }

import uuid
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import date
from app.models.medical_act import MedicalAct


class Consultation(MedicalAct, table=True):
    id: Optional[uuid.UUID] = Field(default=None, foreign_key="medical_act.id", primary_key=True)
    duree_minutes: Optional[int] = None

    __mapper_args__ = {
        "polymorphic_identity": "TypeActe.CONSULTATION",
    }

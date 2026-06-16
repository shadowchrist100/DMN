import uuid
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import date
from app.models.diagnosis import Diagnosis


class Disease(Diagnosis, table=True):
    id: Optional[uuid.UUID] = Field(default=None, foreign_key="diagnosis.id", primary_key=True)

    __mapper_args__ = {
        "polymorphic_identity": "disease",
    }

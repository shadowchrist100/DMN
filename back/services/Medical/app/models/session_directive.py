import uuid
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from app.models.prescription_directive import PrescriptionDirective
from app.types.enums import TypeDirective


class SessionDirective(PrescriptionDirective, table=True):
    id: Optional[uuid.UUID] = Field(default=None, foreign_key="prescription_directive.id", primary_key=True)

    nombre_seances: int
    frequence_hebdo: str
    objectifs_specifiques: str

    __mapper_args__ = {"polymorphic_identity": TypeDirective.SOINS_REED_KINE}

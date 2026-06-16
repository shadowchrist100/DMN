import uuid
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from app.models.prescription_directive import PrescriptionDirective
from app.types.enums import TypeDirective


class LifestyleDirective(PrescriptionDirective, table=True):
    id: Optional[uuid.UUID] = Field(default=None, foreign_key="prescription_directive.id", primary_key=True)

    titre_consigne: str
    recommandations: str

    __mapper_args__ = {"polymorphic_identity": TypeDirective.MODE_DE_VIE}

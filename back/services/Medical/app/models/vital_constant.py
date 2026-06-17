import uuid
from typing import TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

if TYPE_CHECKING:
    from .vital_constant_reference import VitalConstantReference


class VitalConstant(SQLModel, table=True):
    medical_act_id: uuid.UUID = Field(
        foreign_key="medicalact.id",
        primary_key=True
    )
    vital_constant_reference_code: str = Field(
        foreign_key="vitalconstantreference.code",
        primary_key=True
    )

    date_mesure: datetime = Field(default_factory=datetime.now)
    valeur: float

    constant_ref: "VitalConstantReference" = Relationship(back_populates="mesures")
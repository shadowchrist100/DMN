import uuid
from typing import Optional
from sqlmodel import Field, SQLModel,List, Relationship
from datetime import datetime
from app.types.enums import TypeActe


class MedicalActs(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    raisons: Optional[str] = None
    rapport_text: Optional[str] = None
    observations_text: Optional[str] = None


    dmn_id: Optional[uuid.UUID] = Field(
        default = None,    
        foreign_key="dmn.id",
    )
    practitioner_role_id: Optional[uuid.UUID] = Field(
        default = None,
        foreign_key = "practitionerrole.id",
    )
    type: TypeActe 

    __mapper_args__ = {
        "polymorphic_on": "type",
        "polymorphic_identity": "medicalt_act_base"
    }

    dmn: DMN = Relationship(back_populates = "medical_act" )
    practitioner: Practitioner = Relationship (back_populates = "medical_act")

    diagnoses: List["Diagnosis"] = Relationship (back_populates = "medical_act" )

    ordonance: Optional["Ordonnance"] = Relationship(
        back_populates="medical_act",
        sa_relationship_kwargs={'uselist': False}
    )

    vital_constants: List["VitalConstant"] = Relationship(back_populates="medical_act")
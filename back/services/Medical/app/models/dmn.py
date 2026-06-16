import uuid
from typing import Optional,List
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime


class DMN(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    date_creation: datetime = Field(default_factory=datetime.now)
    blood_type: Optional[str] = None
    rhesus_factor: Optional[str] = None

    patient_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="patient.id", unique = True
    )
    authorizations: List["Authorizations"] = Relationship(back_populates="dmn")
    medical_acts : List["MedicalActs"] = Relationship(back_populates = "dmn" )


    # relations
    patient: Optional["Patient"] = Relationship(back_populates = "dmn" )

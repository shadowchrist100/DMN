import uuid
from sqlmodel import SQLModel,Field, Relationship
from typing import Optional
from datetime import date

class PractitionerRole(SQLModel, table = True ):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key = True
    )
    practitioner_id: Optional[uuid.UUID] = Field(
        default = None,    
        foreign_key="practitioner.id",
    )
    health_care_system_id: Optional[uuid.UUID] = Field(
        default = None,    
        foreign_key="healthcaresystem.id",
    )
    role: str
    start_date: date
    end_date: date

    practitioner: "Practitioner" = Relationship(back_populates="roles")
    health_care_system: "HealthCareSystem" = Relationship(back_populates="roles")
    medical_acts : List["MedicalActs"] = Relationship(back_populates = "practitioner_role" )

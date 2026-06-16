import uuid
from sqlmodel import SQLModel,Field
from typing import Optional
from datetime import date

class HealthCareSystem(SQLModel, table = True ):
    id: Optional[uuid.UUID] = Field (
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    type: str
    nom: str
    alias: str
    is_actif: bool
    roles: List[PractitionerRole] = Relationship(back_populates="health_care_system")

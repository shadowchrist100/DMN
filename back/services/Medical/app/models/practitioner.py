import uuid
from sqlmodel import Field, SQLModel
from typing import Optional
from enum import Enum


class Speciality(str, Enum):
    MEDECIN = "medecin"
    INFIRMIER = "infirmier"
    CHIRURGIEN = "chirurgien"
    PEDIATRE = "pediatre"
    GYNECOLOGUE = "gynecologue"
    RADIOLOGUE = "radiologue"
    BIOLOGISTE = "biologiste"
    PHARMACIEN = "pharmacien"
    DENTISTE = "dentiste"
    AUTRE = "autre"


class Practitioner(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    user_id: str = Field(unique=True, index=True)
    speciality: Speciality
    order_number: Optional[str] = None
    organization_id: Optional[str] = None

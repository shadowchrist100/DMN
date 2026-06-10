import uuid
from sqlmodel import Field, SQLModel
from typing import Optional
from enum import Enum

class Speciality(str, Enum):
    MEDECIN = "medecin"

class Practitioner(SQLModel, table= True):
    id: Optional[uuid.UUID] = Field(
        default_factory = uuid.uuid4,
        primary_key = True
    )
    userId: str
    speciality: Speciality
    
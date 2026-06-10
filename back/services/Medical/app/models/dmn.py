import uuid
from sqlmodel import Field, SQLModel
from typing import Optional
from datetime import date

class DMN(SQLModel, table= True):
    id: Optional[uuid.UUID] = Field(
        default_factory = uuid.uuid4,
        primary_key = True
    )
    date_creation: date
    blood_type: str
    rhesus_factor: str
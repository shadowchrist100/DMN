import uuid 
from sqlmodel import SQLModel,Field
from typing import Optional

class EmergencyContact(SQLModel, table=True):
    id: Optional[uuid.UUID]= Field(
        default_factory = uuid.uuid4,
        primary_key = True
    )
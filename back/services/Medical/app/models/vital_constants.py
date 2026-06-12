import uuid
from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime


class VitalConstants(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    date_mesure: datetime
    valeur: str

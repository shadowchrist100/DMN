import uuid
from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime


class PrescriptionOrder(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    date_emission: datetime = Field(default_factory=datetime.now)
    statut: str = Field(default="active")

    medical_act_id: uuid.UUID = Field(foreign_key="medicalact.id", unique=True)

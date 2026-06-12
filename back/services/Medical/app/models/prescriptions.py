import uuid
from sqlmodel import Field, SQLModel
from typing import Optional
from datetime import datetime
from app.types.enums import StatutPrescription


class Prescription(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    date_prescription: datetime = Field(default_factory=datetime.utcnow)
    statut: StatutPrescription = Field(default=StatutPrescription.EN_COURS)

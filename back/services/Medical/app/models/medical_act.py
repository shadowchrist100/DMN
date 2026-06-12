import uuid
from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime
from app.types.enums import TypeActe


class MedicalAct(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    date: datetime
    raisons: str
    rapport_text: str
    obervations_text: str
    type: TypeActe
    care_episode_id: str = Field(foreign_key="careepisode.id")

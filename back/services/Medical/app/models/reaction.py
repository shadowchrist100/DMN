from typing import Optional
import uuid
from sqlmodel import Field, SQLModel, Relationship


class Reaction(SQLModel, table=True):
    allergy_id: uuid.UUID = Field(
        foreign_key="diagnosis.id",
        primary_key=True
    )
    reaction_reference_code: str = Field(
        foreign_key="reactionreference.code",
        primary_key=True
    )
    severity: Optional[str] = None

    reaction_ref: "ReactionReference" = Relationship(back_populates="reactions")

from typing import Optional, TYPE_CHECKING
import uuid
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .allergy import Allergy
    from .reaction_reference import ReactionReference


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

    allergy: "Allergy" = Relationship(back_populates="reactions")
    reaction_ref: "ReactionReference" = Relationship(back_populates="reactions")

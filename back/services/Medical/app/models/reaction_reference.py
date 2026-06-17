from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .reaction import Reaction


class ReactionReference(SQLModel, table=True):
    code: str = Field(primary_key=True)
    libelle: str

    reactions: List["Reaction"] = Relationship(back_populates="reaction_ref")

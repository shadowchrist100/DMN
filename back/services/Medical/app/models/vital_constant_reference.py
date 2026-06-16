from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .vital_constant import VitalConstant


class VitalConstantReference(SQLModel, table=True):
    code: str = Field(primary_key=True)
    nom: str
    unite_mesure: str

    mesures: List["VitalConstant"] = Relationship(back_populates="constant_ref")

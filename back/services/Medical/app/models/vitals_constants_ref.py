from typing import Optional
from sqlmodel import Field, SQLModel


class VitalsConstantsRefs(SQLModel, table=True):
    code: str = Field(primary_key=True)
    poids: Optional[float] = None
    taille: Optional[float] = None
    tension_systolique: Optional[float] = None
    tension_diastolique: Optional[float] = None
    temperature_celsius: Optional[float] = None
    frequence_cardiaque: Optional[float] = None

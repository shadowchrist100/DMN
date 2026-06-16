import uuid
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from app.types.enums import TypeDirective

class OrdonnanceModeDeVie(OrdonnanceDirective, table=True):
    id: Optional[uuid.UUID] = Field(default=None, foreign_key="ordonnancedirective.id", primary_key=True)
    
    titre_consigne: str      # Ex: "Régime hyposodé", "Arrêt total de la marche"
    recommandations: str     # Ex: "Pas de sel de table, privilégier les épices"

    __mapper_args__ = { "polymorphic_identity": TypeDirective.MODE_DE_VIE }
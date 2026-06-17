from typing import List, TYPE_CHECKING
from sqlalchemy import Column, UUID, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.models.diagnosis import Diagnosis

if TYPE_CHECKING:
    from .reaction import Reaction


class Allergy(Diagnosis):
    __tablename__ = "allergy"

    id = Column(UUID, ForeignKey("diagnosis.id"), primary_key=True)
    nature_allergie = Column(String, nullable=False)
    categorie = Column(String, nullable=False)
    libelle = Column(String, nullable=False)
    criticite = Column(String, nullable=False)
    statut_clinique = Column(String, nullable=False)
    discover_at = Column(Date, nullable=False)
    reactions_text = Column(String, nullable=False)

    reactions = relationship("Reaction", back_populates="allergy")

    __mapper_args__ = {
        "polymorphic_identity": "allergy",
    }

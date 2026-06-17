from sqlalchemy import Column, UUID, ForeignKey, String
from app.base import Base


class LifestyleDirective(Base):
    __tablename__ = "lifestyledirective"

    id = Column(UUID, ForeignKey("prescriptiondirective.id"), primary_key=True)
    titre_consigne = Column(String, nullable=False)
    recommandations = Column(String, nullable=False)

    __mapper_args__ = {"polymorphic_identity": "mode_de_vie"}

from sqlalchemy.orm import declarative_base
from sqlmodel import SQLModel

Base = declarative_base(metadata=SQLModel.metadata)

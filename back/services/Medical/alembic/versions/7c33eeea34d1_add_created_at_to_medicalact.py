"""add created_at to medicalact

Revision ID: 7c33eeea34d1
Revises: f5e6d7c8b9a1
Create Date: 2026-06-19 13:47:43.093151

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '7c33eeea34d1'
down_revision: Union[str, Sequence[str], None] = 'f5e6d7c8b9a1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('medicalact', sa.Column('created_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column('medicalact', 'created_at')

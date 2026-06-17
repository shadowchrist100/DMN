"""drop_consent_table

Revision ID: 0a1b2c3d4e5f
Revises: 9a0b1c2d3e4f
Create Date: 2026-06-17 03:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '0a1b2c3d4e5f'
down_revision: Union[str, Sequence[str], None] = '9a0b1c2d3e4f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_table('consent')


def downgrade() -> None:
    op.create_table('consent',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('perimeter', sa.Enum('ALL', 'PRESCRIPTIONS', name='perimeter'), nullable=False),
        sa.Column('granted_at', sa.Date(), nullable=False),
        sa.Column('expire_at', sa.Date(), nullable=False),
        sa.Column('duration', sa.Enum('MIN_30', 'H_1', name='duration'), nullable=False),
        sa.Column('is_actif', sa.Boolean(), nullable=False),
        sa.Column('is_urgence', sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

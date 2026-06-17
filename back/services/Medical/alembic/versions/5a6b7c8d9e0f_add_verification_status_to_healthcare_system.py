"""add_verification_status_to_healthcare_system

Revision ID: 5a6b7c8d9e0f
Revises: 4f5e6d7c8b9a
Create Date: 2026-06-17 01:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


revision: str = '5a6b7c8d9e0f'
down_revision: Union[str, Sequence[str], None] = '4f5e6d7c8b9a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('healthcaresystem', sa.Column('verification_status', sa.Enum('EN_ATTENTE', 'VALIDE', 'REJETE', name='statutverification'), nullable=False, server_default='En attente'))


def downgrade() -> None:
    op.drop_column('healthcaresystem', 'verification_status')

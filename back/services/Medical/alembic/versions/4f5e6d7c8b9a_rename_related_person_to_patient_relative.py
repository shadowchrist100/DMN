"""rename_related_person_to_patient_relative

Revision ID: 4f5e6d7c8b9a
Revises: 3a1b2c3d4e5f
Create Date: 2026-06-17 01:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


revision: str = '4f5e6d7c8b9a'
down_revision: Union[str, Sequence[str], None] = '3a1b2c3d4e5f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.rename_table('relatedperson', 'patientrelative')
    op.add_column('patientrelative', sa.Column('emergency_contact', sa.Boolean(), server_default=sa.text('false'), nullable=False))


def downgrade() -> None:
    op.drop_column('patientrelative', 'emergency_contact')
    op.rename_table('patientrelative', 'relatedperson')

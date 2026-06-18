"""add_first_name_last_name_to_patient

Revision ID: b0c1d2e3f4a5
Revises: e5f4d3c2b1a0
Create Date: 2026-06-18 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b0c1d2e3f4a5'
down_revision: Union[str, Sequence[str], None] = 'e5f4d3c2b1a0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('patient', sa.Column('first_name', sa.String(), nullable=True))
    op.add_column('patient', sa.Column('last_name', sa.String(), nullable=True))
    op.create_index(op.f('ix_patient_first_name'), 'patient', ['first_name'])
    op.create_index(op.f('ix_patient_last_name'), 'patient', ['last_name'])


def downgrade() -> None:
    op.drop_index(op.f('ix_patient_last_name'), table_name='patient')
    op.drop_index(op.f('ix_patient_first_name'), table_name='patient')
    op.drop_column('patient', 'last_name')
    op.drop_column('patient', 'first_name')

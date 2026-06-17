"""add_care_episode_link_to_medical_act

Revision ID: 1b2c3d4e5f6f
Revises: 0a1b2c3d4e5f
Create Date: 2026-06-17 03:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


revision: str = '1b2c3d4e5f6f'
down_revision: Union[str, Sequence[str], None] = '0a1b2c3d4e5f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint('careepisode_diagnosis_id_key', 'careepisode', type_='unique')
    op.alter_column('careepisode', 'end_date', nullable=True)
    op.add_column('medicalact',
        sa.Column('care_episode_id', sa.Uuid(), nullable=True)
    )
    op.create_foreign_key('medicalact_care_episode_id_fkey', 'medicalact', 'careepisode', ['care_episode_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint('medicalact_care_episode_id_fkey', 'medicalact', type_='foreignkey')
    op.drop_column('medicalact', 'care_episode_id')
    op.alter_column('careepisode', 'end_date', nullable=False)
    op.create_unique_constraint('careepisode_diagnosis_id_key', 'careepisode', ['diagnosis_id'])

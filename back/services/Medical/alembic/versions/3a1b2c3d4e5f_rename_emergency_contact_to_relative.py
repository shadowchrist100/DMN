"""rename_emergency_contact_to_relative

Revision ID: 3a1b2c3d4e5f
Revises: 2eb0c3e09fb3
Create Date: 2026-06-17 01:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


revision: str = '3a1b2c3d4e5f'
down_revision: Union[str, Sequence[str], None] = '2eb0c3e09fb3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.rename_table('emergencycontact', 'relative')
    op.alter_column('relatedperson', 'emergency_contact_id', new_column_name='relative_id')
    op.drop_constraint('relatedperson_emergency_contact_id_fkey', 'relatedperson', type_='foreignkey')
    op.create_foreign_key('relatedperson_relative_id_fkey', 'relatedperson', 'relative', ['relative_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint('relatedperson_relative_id_fkey', 'relatedperson', type_='foreignkey')
    op.create_foreign_key('relatedperson_emergency_contact_id_fkey', 'relatedperson', 'emergencycontact', ['relative_id'], ['id'])
    op.alter_column('relatedperson', 'relative_id', new_column_name='emergency_contact_id')
    op.rename_table('relative', 'emergencycontact')

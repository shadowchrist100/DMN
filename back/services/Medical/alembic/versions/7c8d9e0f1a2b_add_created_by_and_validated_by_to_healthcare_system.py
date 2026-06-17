"""add_created_by_and_validated_by_to_healthcare_system

Revision ID: 7c8d9e0f1a2b
Revises: 5a6b7c8d9e0f
Create Date: 2026-06-17 02:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '7c8d9e0f1a2b'
down_revision: Union[str, Sequence[str], None] = '5a6b7c8d9e0f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('healthcaresystem', sa.Column('created_by', sa.String(), nullable=False, server_default=''))
    op.add_column('healthcaresystem', sa.Column('validated_by', sa.String(), nullable=True))
    op.add_column('healthcaresystem', sa.Column('validated_at', sa.DateTime(), nullable=True))
    op.add_column('healthcaresystem', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('healthcaresystem', sa.Column('updated_at', sa.DateTime(), nullable=True))
    op.create_index(op.f('ix_healthcaresystem_created_by'), 'healthcaresystem', ['created_by'])


def downgrade() -> None:
    op.drop_index(op.f('ix_healthcaresystem_created_by'), table_name='healthcaresystem')
    op.drop_column('healthcaresystem', 'updated_at')
    op.drop_column('healthcaresystem', 'created_at')
    op.drop_column('healthcaresystem', 'validated_at')
    op.drop_column('healthcaresystem', 'validated_by')
    op.drop_column('healthcaresystem', 'created_by')

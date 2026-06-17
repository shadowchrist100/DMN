"""merge_heads_and_add_city_address_phone_email

Revision ID: e5f4d3c2b1a0
Revises: 7c8d9e0f1a2b, 2b3c4d5e6f7f
Create Date: 2026-06-17 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'e5f4d3c2b1a0'
down_revision: Union[str, Sequence[str], None] = ('7c8d9e0f1a2b', '2b3c4d5e6f7f')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('healthcaresystem', sa.Column('city', sa.String(), nullable=False, server_default=''))
    op.add_column('healthcaresystem', sa.Column('address', sa.String(), nullable=False, server_default=''))
    op.add_column('healthcaresystem', sa.Column('phone', sa.String(), nullable=False, server_default=''))
    op.add_column('healthcaresystem', sa.Column('email', sa.String(), nullable=False, server_default=''))
    op.create_index(op.f('ix_healthcaresystem_city'), 'healthcaresystem', ['city'])


def downgrade() -> None:
    op.drop_index(op.f('ix_healthcaresystem_city'), table_name='healthcaresystem')
    op.drop_column('healthcaresystem', 'email')
    op.drop_column('healthcaresystem', 'phone')
    op.drop_column('healthcaresystem', 'address')
    op.drop_column('healthcaresystem', 'city')

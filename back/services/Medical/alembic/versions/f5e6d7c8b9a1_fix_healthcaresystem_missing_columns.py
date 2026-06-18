"""fix_healthcaresystem_missing_columns

Revision ID: f5e6d7c8b9a1
Revises: b0c1d2e3f4a5
Create Date: 2026-06-18 12:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'f5e6d7c8b9a1'
down_revision: Union[str, Sequence[str], None] = 'b0c1d2e3f4a5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    for col, type_, nullable, server_default in [
        ('city', sa.String(), False, ''),
        ('address', sa.String(), False, ''),
        ('phone', sa.String(), False, ''),
        ('email', sa.String(), False, ''),
        ('verification_status', sa.String(), False, 'en_attente'),
        ('created_by', sa.String(), True, None),
        ('validated_by', sa.String(), True, None),
        ('validated_at', sa.DateTime(), True, None),
        ('created_at', sa.DateTime(), True, None),
        ('updated_at', sa.DateTime(), True, None),
    ]:
        try:
            op.add_column('healthcaresystem', sa.Column(col, type_, nullable=nullable, server_default=server_default))
        except Exception:
            pass  # column may already exist


def downgrade() -> None:
    pass

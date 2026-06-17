"""make_end_date_nullable_in_practitioner_role

Revision ID: 6a7b8c9d0e1f
Revises: 5a6b7c8d9e0f
Create Date: 2026-06-17 01:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


revision: str = '6a7b8c9d0e1f'
down_revision: Union[str, Sequence[str], None] = '5a6b7c8d9e0f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('practitionerrole', 'end_date', nullable=True)


def downgrade() -> None:
    op.alter_column('practitionerrole', 'end_date', nullable=False)

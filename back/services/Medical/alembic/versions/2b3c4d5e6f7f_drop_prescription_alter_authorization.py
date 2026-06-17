"""drop_prescription_alter_authorization_consultation

Revision ID: 2b3c4d5e6f7f
Revises: 1b2c3d4e5f6f
Create Date: 2026-06-17 03:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '2b3c4d5e6f7f'
down_revision: Union[str, Sequence[str], None] = '1b2c3d4e5f6f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_table('prescription')
    op.drop_column('authorization', 'granted_by')
    op.add_column('consultation',
        sa.Column('motif', sa.String(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('consultation', 'motif')
    op.add_column('authorization',
        sa.Column('granted_by', sa.Uuid(), nullable=True)
    )
    op.create_table('prescription',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('date_prescription', sa.DateTime(), nullable=False),
        sa.Column('statut', sa.String(), nullable=False),
        sa.Column('special_instructions', sa.String(), nullable=False),
        sa.Column('diagnosis_id', sa.Uuid(), nullable=True),
        sa.Column('type', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['diagnosis_id'], ['diagnosis.id']),
        sa.PrimaryKeyConstraint('id')
    )

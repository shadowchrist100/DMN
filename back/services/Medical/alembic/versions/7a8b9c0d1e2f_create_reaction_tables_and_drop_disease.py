"""create_reaction_tables_and_drop_disease

Revision ID: 7a8b9c0d1e2f
Revises: 6a7b8c9d0e1f
Create Date: 2026-06-17 02:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


revision: str = '7a8b9c0d1e2f'
down_revision: Union[str, Sequence[str], None] = '6a7b8c9d0e1f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('reactionreference',
        sa.Column('code', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('libelle', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.PrimaryKeyConstraint('code')
    )
    op.create_table('reaction',
        sa.Column('allergy_id', sa.Uuid(), nullable=False),
        sa.Column('reaction_reference_code', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('severity', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.ForeignKeyConstraint(['allergy_id'], ['diagnosis.id'], ),
        sa.ForeignKeyConstraint(['reaction_reference_code'], ['reactionreference.code'], ),
        sa.PrimaryKeyConstraint('allergy_id', 'reaction_reference_code')
    )
    op.drop_table('disease')


def downgrade() -> None:
    op.create_table('disease',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['id'], ['diagnosis.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.drop_table('reaction')
    op.drop_table('reactionreference')

"""merge_session_and_lifestyle_into_prescriptiondesoins

Revision ID: 8a9b0c1d2e3f
Revises: 7a8b9c0d1e2f
Create Date: 2026-06-17 02:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


revision: str = '8a9b0c1d2e3f'
down_revision: Union[str, Sequence[str], None] = '7a8b9c0d1e2f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('prescriptiondesoins',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('sous_type', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('nombre_seances', sa.Integer(), nullable=True),
        sa.Column('frequence_hebdo', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('objectifs', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('titre_consigne', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('recommandations', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.ForeignKeyConstraint(['id'], ['prescriptiondirective.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.execute("""
        INSERT INTO prescriptiondesoins (id, sous_type, nombre_seances, frequence_hebdo, objectifs)
        SELECT id, 'seances', nombre_seances, frequence_hebdo, objectifs_specifiques
        FROM sessiondirective
    """)
    op.execute("""
        INSERT INTO prescriptiondesoins (id, sous_type, titre_consigne, recommandations)
        SELECT id, 'conseil', titre_consigne, recommandations
        FROM lifestyledirective
    """)
    op.execute("""
        UPDATE prescriptiondirective
        SET type_directive = 'soins'
        WHERE type_directive IN ('soins_reed_kine', 'mode_de_vie')
    """)
    op.drop_table('lifestyledirective')
    op.drop_table('sessiondirective')


def downgrade() -> None:
    op.create_table('sessiondirective',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('nombre_seances', sa.Integer(), nullable=False),
        sa.Column('frequence_hebdo', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('objectifs_specifiques', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.ForeignKeyConstraint(['id'], ['prescriptiondirective.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table('lifestyledirective',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('titre_consigne', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('recommandations', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.ForeignKeyConstraint(['id'], ['prescriptiondirective.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.execute("""
        UPDATE prescriptiondirective
        SET type_directive = 'soins_reed_kine'
        FROM prescriptiondesoins
        WHERE prescriptiondesoins.id = prescriptiondirective.id
        AND prescriptiondesoins.sous_type = 'seances'
    """)
    op.execute("""
        UPDATE prescriptiondirective
        SET type_directive = 'mode_de_vie'
        FROM prescriptiondesoins
        WHERE prescriptiondesoins.id = prescriptiondirective.id
        AND prescriptiondesoins.sous_type = 'conseil'
    """)
    op.execute("""
        INSERT INTO sessiondirective (id, nombre_seances, frequence_hebdo, objectifs_specifiques)
        SELECT id, nombre_seances, frequence_hebdo, objectifs
        FROM prescriptiondesoins
        WHERE sous_type = 'seances'
    """)
    op.execute("""
        INSERT INTO lifestyledirective (id, titre_consigne, recommandations)
        SELECT id, titre_consigne, recommandations
        FROM prescriptiondesoins
        WHERE sous_type = 'conseil'
    """)
    op.drop_table('prescriptiondesoins')

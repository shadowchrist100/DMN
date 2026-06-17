"""create_prescription_examen_and_diagnostic_evidence

Revision ID: 9a0b1c2d3e4f
Revises: 8a9b0c1d2e3f
Create Date: 2026-06-17 02:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


revision: str = '9a0b1c2d3e4f'
down_revision: Union[str, Sequence[str], None] = '8a9b0c1d2e3f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('prescriptionexamen',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('date_prescription', sa.DateTime(), nullable=False),
        sa.Column('statut', sa.Enum('EN_COURS', 'DISPENSE', 'ANNULE', 'TERMINE', name='statutprescription'), nullable=False),
        sa.Column('special_instructions', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('medical_act_id', sa.Uuid(), nullable=False),
        sa.Column('type_prescription', sa.Enum('VACCIN', 'EXAMINATION', name='typeprescription'), nullable=False),
        sa.ForeignKeyConstraint(['medical_act_id'], ['medicalact.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.execute("""
        INSERT INTO prescriptionexamen (id, date_prescription, statut, special_instructions, medical_act_id, type_prescription)
        SELECT p.id, p.date_prescription, p.statut, p.special_instructions, d.medical_act_id, p.type_prescription
        FROM prescription p
        JOIN diagnosis d ON d.id = p.diagnosis_id
        WHERE p.type_prescription IN ('examination', 'vaccin')
    """)
    op.drop_constraint('examination_id_fkey', 'examination', type_='foreignkey')
    op.drop_constraint('vaccine_id_fkey', 'vaccine', type_='foreignkey')
    op.create_foreign_key('examination_id_fkey', 'examination', 'prescriptionexamen', ['id'], ['id'])
    op.create_foreign_key('vaccine_id_fkey', 'vaccine', 'prescriptionexamen', ['id'], ['id'])
    op.execute("""
        DELETE FROM prescription
        WHERE id IN (SELECT id FROM examination)
           OR id IN (SELECT id FROM vaccine)
    """)
    op.add_column('examinationact',
        sa.Column('prescription_examen_id', sa.Uuid(), nullable=True)
    )
    op.create_foreign_key('examinationact_prescription_examen_id_fkey', 'examinationact', 'prescriptionexamen', ['prescription_examen_id'], ['id'])
    op.create_table('diagnosticevidence',
        sa.Column('diagnosis_id', sa.Uuid(), nullable=False),
        sa.Column('examination_act_id', sa.Uuid(), nullable=False),
        sa.Column('type', sa.Enum('CONFIRME', 'INFIRME', name='typeevidence'), nullable=False),
        sa.ForeignKeyConstraint(['diagnosis_id'], ['diagnosis.id'], ),
        sa.ForeignKeyConstraint(['examination_act_id'], ['examinationact.id'], ),
        sa.PrimaryKeyConstraint('diagnosis_id', 'examination_act_id')
    )


def downgrade() -> None:
    op.drop_table('diagnosticevidence')
    op.drop_constraint('examinationact_prescription_examen_id_fkey', 'examinationact', type_='foreignkey')
    op.drop_column('examinationact', 'prescription_examen_id')
    op.execute("""
        INSERT INTO prescription (id, date_prescription, statut, special_instructions, diagnosis_id, type_prescription)
        SELECT pe.id, pe.date_prescription, pe.statut, pe.special_instructions, d.id, pe.type_prescription
        FROM prescriptionexamen pe
        JOIN medical_act ma ON ma.id = pe.medical_act_id
        JOIN dmn ON dmn.id = ma.dmn_id
        JOIN patient ON patient.id = dmn.patient_id
        JOIN diagnosis d ON d.medical_act_id = ma.id
        WHERE pe.type_prescription IN ('examination', 'vaccin')
    """)
    op.drop_constraint('vaccine_id_fkey', 'vaccine', type_='foreignkey')
    op.drop_constraint('examination_id_fkey', 'examination', type_='foreignkey')
    op.create_foreign_key('vaccine_id_fkey', 'vaccine', 'prescription', ['id'], ['id'])
    op.create_foreign_key('examination_id_fkey', 'examination', 'prescription', ['id'], ['id'])
    op.drop_table('prescriptionexamen')

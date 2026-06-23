"""add missing duration enum values

Revision ID: f0b804a5b008
Revises: 7c33eeea34d1
Create Date: 2026-06-22 14:26:02.966997

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f0b804a5b008"
down_revision: Union[str, Sequence[str], None] = "7c33eeea34d1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


MISSING_VALUES = ["H_2", "H_24", "J_7", "J_30", "INDETERMINEE"]


def upgrade() -> None:
    conn = op.get_bind()
    if conn.dialect.name != "postgresql":
        return

    for val in MISSING_VALUES:
        # ALTER TYPE ... ADD VALUE can't be rolled back, but PG 14+ allows it
        # inside a transaction (just won't roll back). We use a DO block to
        # safely skip values that already exist.
        op.execute(
            sa.text(
                f"""
                DO $$
                BEGIN
                    ALTER TYPE duration ADD VALUE '{val}';
                EXCEPTION
                    WHEN duplicate_object THEN NULL;
                END $$;
                """
            )
        )


def downgrade() -> None:
    # PostgreSQL does not support removing values from an enum.
    pass

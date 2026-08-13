"""Make lesson_attempts.crown_earned NOT NULL

Revision ID: c4a8e1f02b3d
Revises: 1134fcb0aa41
Create Date: 2026-08-14 01:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c4a8e1f02b3d"
down_revision: Union[str, Sequence[str], None] = "1134fcb0aa41"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text("UPDATE lesson_attempts SET crown_earned = 0 WHERE crown_earned IS NULL")
    )
    with op.batch_alter_table("lesson_attempts", schema=None) as batch_op:
        batch_op.alter_column(
            "crown_earned",
            existing_type=sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        )


def downgrade() -> None:
    with op.batch_alter_table("lesson_attempts", schema=None) as batch_op:
        batch_op.alter_column(
            "crown_earned",
            existing_type=sa.Boolean(),
            nullable=True,
            server_default=None,
        )

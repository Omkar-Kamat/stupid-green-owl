"""Add gems >= 0 check constraint to user_stats."""

from typing import Sequence, Union

from alembic import op

revision: str = "d5e6f7a8b9c0"
down_revision: Union[str, None] = "c4a8e1f02b3d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("user_stats") as batch_op:
        batch_op.create_check_constraint("chk_gems_positive", "gems >= 0")


def downgrade() -> None:
    with op.batch_alter_table("user_stats") as batch_op:
        batch_op.drop_constraint("chk_gems_positive", type_="check")

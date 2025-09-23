from alembic import op
import sqlalchemy as sa


revision = "001_init_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "brewery",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("prefecture", sa.Text(), nullable=False),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("url", sa.Text(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
    )

    op.create_table(
        "sake",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("brewery_id", sa.Integer(), sa.ForeignKey("brewery.id"), nullable=False),
        sa.Column("region", sa.Text(), nullable=False),
        sa.Column("rice", sa.Text(), nullable=True),
        sa.Column("seimaibuai", sa.Integer(), nullable=True),
        sa.Column("nihonshudo", sa.Numeric(), nullable=True),
        sa.Column("acid", sa.Numeric(), nullable=True),
        sa.Column("alcohol", sa.Numeric(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_url", sa.Text(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.text("now()"), nullable=False),
    )

    op.create_index("ix_sake_region", "sake", ["region"]) 
    op.create_index("ix_sake_brewery_id", "sake", ["brewery_id"]) 

    op.create_table(
        "taste_tag",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("label", sa.Text(), nullable=False, unique=True),
    )

    op.create_table(
        "sake_taste_tag_map",
        sa.Column("sake_id", sa.Integer(), sa.ForeignKey("sake.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("tag_id", sa.Integer(), sa.ForeignKey("taste_tag.id", ondelete="CASCADE"), primary_key=True),
    )

    op.create_index("ix_map_tag_id", "sake_taste_tag_map", ["tag_id"]) 


def downgrade() -> None:
    op.drop_index("ix_map_tag_id", table_name="sake_taste_tag_map")
    op.drop_table("sake_taste_tag_map")
    op.drop_table("taste_tag")
    op.drop_index("ix_sake_brewery_id", table_name="sake")
    op.drop_index("ix_sake_region", table_name="sake")
    op.drop_table("sake")
    op.drop_table("brewery")


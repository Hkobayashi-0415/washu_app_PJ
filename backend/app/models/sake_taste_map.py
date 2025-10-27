from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class SakeTasteTagMap(Base):
    __tablename__ = "sake_taste_tag_map"

    sake_id: Mapped[int] = mapped_column(ForeignKey("sake.id", ondelete="CASCADE"), primary_key=True)
    tag_id: Mapped[int] = mapped_column(ForeignKey("taste_tag.id", ondelete="CASCADE"), primary_key=True)


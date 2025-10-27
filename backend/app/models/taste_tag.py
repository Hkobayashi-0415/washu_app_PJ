from sqlalchemy import Integer, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class TasteTag(Base):
    __tablename__ = "taste_tag"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    label: Mapped[str] = mapped_column(Text, unique=True, nullable=False)


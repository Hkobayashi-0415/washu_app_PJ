from sqlalchemy import Integer, Text, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Brewery(Base):
    __tablename__ = "brewery"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    prefecture: Mapped[str] = mapped_column(Text, nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[str] = mapped_column(TIMESTAMP(timezone=False), server_default=func.now(), nullable=False)

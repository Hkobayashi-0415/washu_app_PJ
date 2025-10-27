from sqlalchemy import Integer, Text, TIMESTAMP, ForeignKey, Numeric, func, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Sake(Base):
    __tablename__ = "sake"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    brewery_id: Mapped[int] = mapped_column(ForeignKey("brewery.id", ondelete="RESTRICT"), nullable=False)
    region: Mapped[str] = mapped_column(Text, nullable=False)
    rice: Mapped[str | None] = mapped_column(Text, nullable=True)
    seimaibuai: Mapped[int | None] = mapped_column(Integer, nullable=True)
    nihonshudo: Mapped[float | None] = mapped_column(Numeric, nullable=True)
    acid: Mapped[float | None] = mapped_column(Numeric, nullable=True)
    alcohol: Mapped[float | None] = mapped_column(Numeric, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[str] = mapped_column(TIMESTAMP(timezone=False), server_default=func.now(), nullable=False)

    brewery = relationship("Brewery")


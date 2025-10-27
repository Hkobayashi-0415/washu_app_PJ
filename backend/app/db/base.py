from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""


# Import models so that they are registered on Base.metadata when this module
# is imported. The imports are intentionally kept at the bottom to avoid
# circular import issues.
from app.models import brewery, sake, sake_taste_map, taste_tag  # noqa: F401

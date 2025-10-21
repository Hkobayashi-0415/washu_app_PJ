import os
import sys
from pathlib import Path
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

CURRENT_DIR = Path(__file__).resolve().parent
# Ensure the backend root (…/backend) is on sys.path so `import app.*` works in CI and local
# parents indexing: 0=migrations, 1=db, 2=app, 3=backend (from right to left)
# To reach …/backend from …/backend/app/db/migrations, use parents[2].
BACKEND_ROOT = CURRENT_DIR.parents[2]
backend_root_str = str(BACKEND_ROOT)
if backend_root_str not in sys.path:
    sys.path.insert(0, backend_root_str)

from app.db.base import Base  # Base only
# Import models explicitly so they are registered in metadata
import app.models.brewery  # noqa: F401
import app.models.sake  # noqa: F401
import app.models.taste_tag  # noqa: F401
import app.models.sake_taste_map  # noqa: F401


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Override sqlalchemy.url from env if present
db_url = os.getenv("DATABASE_URL")
if db_url:
    config.set_main_option("sqlalchemy.url", db_url)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

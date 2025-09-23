import argparse
import csv
from pathlib import Path
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.brewery import Brewery
from app.models.sake import Sake
from app.models.taste_tag import TasteTag
from app.models.sake_taste_map import SakeTasteTagMap


def upsert(table, values: dict):
    stmt = insert(table).values(**values)
    stmt = stmt.on_conflict_do_nothing()
    return stmt


def load_seed(dirpath: Path, db: Session):
    # breweries.csv: id,name,prefecture,address?,url?
    with (dirpath / "breweries.csv").open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            vals = {
                "id": int(row["id"]),
                "name": row["name"],
                "prefecture": row["prefecture"],
                "address": row.get("address") or None,
                "url": row.get("url") or None,
            }
            db.execute(upsert(Brewery, vals))

    # taste_tags.csv: id,label
    with (dirpath / "taste_tags.csv").open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            vals = {"id": int(row["id"]), "label": row["label"]}
            db.execute(upsert(TasteTag, vals))

    # sake.csv
    with (dirpath / "sake.csv").open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            def to_float(x):
                return float(x) if x else None

            def to_int(x):
                return int(x) if x else None

            vals = {
                "id": int(row["id"]),
                "name": row["name"],
                "brewery_id": int(row["brewery_id"]),
                "region": row["region"],
                "rice": row.get("rice") or None,
                "seimaibuai": to_int(row.get("seimaibuai")),
                "nihonshudo": to_float(row.get("nihonshudo")),
                "acid": to_float(row.get("acid")),
                "alcohol": to_float(row.get("alcohol")),
                "description": row.get("description") or None,
                "image_url": row.get("image_url") or None,
            }
            db.execute(upsert(Sake, vals))

    # sake_taste_map.csv: sake_id,tag_id
    with (dirpath / "sake_taste_map.csv").open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            vals = {"sake_id": int(row["sake_id"]), "tag_id": int(row["tag_id"])}
            db.execute(upsert(SakeTasteTagMap, vals))

    db.commit()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dir", required=True, help="seed directory path")
    args = parser.parse_args()
    dirpath = Path(args.dir)
    if not dirpath.exists():
        raise SystemExit(f"seed dir not found: {dirpath}")

    db = SessionLocal()
    try:
        load_seed(dirpath, db)
        print("seed loaded")
    finally:
        db.close()


if __name__ == "__main__":
    main()


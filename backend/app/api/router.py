from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.brewery import Brewery
from app.models.sake import Sake
from app.models.taste_tag import TasteTag
from app.models.sake_taste_map import SakeTasteTagMap
from app.schemas.sake import SearchResponse, SakeSummary, SakeDetail


router = APIRouter(prefix="/api/v1")


@router.get("/sake/search", response_model=SearchResponse)
def search_sake(
    q: str | None = Query(default=None),
    region: str | None = Query(default=None),
    sweetness: int | None = Query(default=None, ge=-2, le=2),  # reserved, ignored in MVP
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    stmt = select(Sake, Brewery).join(Brewery, Brewery.id == Sake.brewery_id)

    if q:
        like = f"%{q}%"
        stmt = stmt.where(
            or_(
                Sake.name.ilike(like),
                Brewery.name.ilike(like),
                Sake.description.ilike(like),
            )
        )
    if region:
        stmt = stmt.where(Sake.region == region)

    total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar_one()

    stmt = stmt.offset((page - 1) * per_page).limit(per_page)
    rows = db.execute(stmt).all()

    # Fetch tags in bulk for returned sake ids
    sake_ids = [row.Sake.id for row in rows]
    tags_map: dict[int, list[str]] = {}
    if sake_ids:
        tag_rows = db.execute(
            select(SakeTasteTagMap.sake_id, TasteTag.label)
            .join(TasteTag, TasteTag.id == SakeTasteTagMap.tag_id)
            .where(SakeTasteTagMap.sake_id.in_(sake_ids))
        ).all()
        for sid, label in tag_rows:
            tags_map.setdefault(sid, []).append(label)

    items = [
        SakeSummary(
            id=row.Sake.id,
            name=row.Sake.name,
            brewery=row.Brewery.name,
            region=row.Sake.region,
            tags=tags_map.get(row.Sake.id, []),
            image_url=row.Sake.image_url,
        )
        for row in rows
    ]

    return SearchResponse(items=items, page=page, per_page=per_page, total=total)


@router.get("/sake/{sake_id}", response_model=SakeDetail)
def get_sake_detail(sake_id: int, db: Session = Depends(get_db)):
    row = db.execute(
        select(Sake, Brewery).join(Brewery, Brewery.id == Sake.brewery_id).where(Sake.id == sake_id)
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "sake not found"})

    tag_rows = db.execute(
        select(TasteTag.label)
        .join(SakeTasteTagMap, TasteTag.id == SakeTasteTagMap.tag_id)
        .where(SakeTasteTagMap.sake_id == row.Sake.id)
    ).scalars().all()

    return SakeDetail(
        id=row.Sake.id,
        name=row.Sake.name,
        brewery=row.Brewery.name,
        region=row.Sake.region,
        tags=tag_rows,
        rice=row.Sake.rice,
        seimaibuai=row.Sake.seimaibuai,
        nihonshudo=float(row.Sake.nihonshudo) if row.Sake.nihonshudo is not None else None,
        acid=float(row.Sake.acid) if row.Sake.acid is not None else None,
        alcohol=float(row.Sake.alcohol) if row.Sake.alcohol is not None else None,
        taste_tags=tag_rows,
        description=row.Sake.description,
        image_url=row.Sake.image_url,
    )


@router.get("/meta/regions")
def get_regions(db: Session = Depends(get_db)):
    rows = db.execute(select(Sake.region).distinct().order_by(Sake.region)).scalars().all()
    return {"regions": rows}


@router.get("/meta/taste-tags")
def get_taste_tags(db: Session = Depends(get_db)):
    rows = db.execute(select(TasteTag.label).order_by(TasteTag.label)).scalars().all()
    return {"tags": rows}

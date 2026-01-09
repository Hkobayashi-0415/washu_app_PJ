from typing import List, Optional
from pydantic import BaseModel


class SakeSummary(BaseModel):
    id: int
    name: str
    brewery: str
    region: str
    tags: List[str] = []
    image_url: Optional[str] = None


class SakeDetail(BaseModel):
    id: int
    name: str
    brewery: str
    region: str
    tags: List[str] = []
    rice: Optional[str] = None
    seimaibuai: Optional[int] = None
    nihonshudo: Optional[float] = None
    acid: Optional[float] = None
    alcohol: Optional[float] = None
    taste_tags: List[str] = []
    description: Optional[str] = None
    image_url: Optional[str] = None


class SearchResponse(BaseModel):
    items: List[SakeSummary]
    page: int
    per_page: int
    total: int

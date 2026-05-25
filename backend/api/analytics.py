from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.database import get_db
from db import crud

router = APIRouter()


@router.get("/analytics")
def get_analytics(
    company_id: str | None = None,
    db: Session = Depends(get_db),
):
    return crud.get_analytics(db, company_id=company_id)

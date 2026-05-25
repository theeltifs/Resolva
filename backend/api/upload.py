import asyncio
import os
import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile
from pydantic import BaseModel

from config import settings
from rag.ingestion import ingest_document

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".txt"}


def _verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != settings.upload_api_key:
        raise HTTPException(status_code=403, detail="Invalid API key")


class UploadResponse(BaseModel):
    company_id: str
    filename: str
    chunks_ingested: int
    message: str


@router.post(
    "/upload",
    response_model=UploadResponse,
    dependencies=[Depends(_verify_api_key)],
)
async def upload_knowledge_base(
    company_id: str,
    file: UploadFile = File(...),
):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not supported. Allowed: {ALLOWED_EXTENSIONS}",
        )

    content = await file.read()
    max_bytes = settings.max_upload_size_mb * 1024 * 1024

    if len(content) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {settings.max_upload_size_mb}MB limit",
        )

    if not content:
        raise HTTPException(status_code=400, detail="File is empty")

    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        chunks = await asyncio.to_thread(ingest_document, tmp_path, company_id)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    finally:
        os.unlink(tmp_path)

    return UploadResponse(
        company_id=company_id,
        filename=file.filename or "unknown",
        chunks_ingested=chunks,
        message=f"Successfully indexed {chunks} chunks into company '{company_id}' knowledge base.",
    )

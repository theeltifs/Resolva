import uuid
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader

from rag.embedder import get_embedder, get_chroma_client

ALLOWED_EXTENSIONS = {".pdf", ".txt"}


def ingest_document(file_path: str, company_id: str) -> int:
    path = Path(file_path)

    if path.suffix.lower() == ".pdf":
        text = _extract_pdf(file_path)
    else:
        text = path.read_text(encoding="utf-8", errors="ignore")

    if not text.strip():
        raise ValueError("Document is empty or could not be read")

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(text)

    if not chunks:
        raise ValueError("No text chunks produced from document")

    client = get_chroma_client()
    collection = client.get_or_create_collection(name=f"company_{company_id}")

    embedder = get_embedder()
    embeddings = embedder.encode(chunks).tolist()
    ids = [str(uuid.uuid4()) for _ in chunks]

    collection.add(documents=chunks, embeddings=embeddings, ids=ids)
    return len(chunks)


def _extract_pdf(path: str) -> str:
    reader = PdfReader(path)
    return "\n".join(page.extract_text() or "" for page in reader.pages)

from __future__ import annotations

from sentence_transformers import SentenceTransformer
import chromadb

from config import settings

_embedder: SentenceTransformer | None = None
_chroma_client: chromadb.PersistentClient | None = None


def get_embedder() -> SentenceTransformer:
    global _embedder
    if _embedder is None:
        _embedder = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedder


def get_chroma_client() -> chromadb.PersistentClient:
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path=settings.chroma_db_path)
    return _chroma_client

from rag.embedder import get_embedder, get_chroma_client


def retrieve_docs(query: str, company_id: str, top_k: int = 4) -> list[str]:
    client = get_chroma_client()
    collection_name = f"company_{company_id}"

    try:
        collection = client.get_collection(name=collection_name)
    except Exception:
        return []

    count = collection.count()
    if count == 0:
        return []

    embedder = get_embedder()
    query_embedding = embedder.encode([query]).tolist()[0]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, count),
    )

    if not results["documents"] or not results["documents"][0]:
        return []

    return results["documents"][0]

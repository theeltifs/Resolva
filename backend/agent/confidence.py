from sentence_transformers import util

from rag.embedder import get_embedder

_UNCERTAINTY_PHRASES = [
    "i don't have enough information",
    "i cannot find",
    "not mentioned in",
    "i'm not sure",
    "i don't know",
    "no information available",
    "i cannot answer",
    "outside my knowledge",
    "not covered in",
    "i do not have",
    "cannot be found",
]


def calculate_confidence(
    query: str,
    answer: str,
    docs: list[str],
    doc_count: int,
) -> float:
    answer_lower = answer.lower()

    # Hard signals — return early without embedding computation
    if any(phrase in answer_lower for phrase in _UNCERTAINTY_PHRASES):
        return 0.15

    if doc_count == 0:
        return 0.10

    embedder = get_embedder()

    # Signal 1: semantic similarity between answer and retrieved docs
    doc_text = " ".join(docs[:2])
    doc_embeddings = embedder.encode([answer, doc_text])
    doc_sim = float(util.cos_sim(doc_embeddings[0], doc_embeddings[1]))

    # Signal 2: semantic relevance between answer and original query
    qa_embeddings = embedder.encode([query, answer])
    query_sim = float(util.cos_sim(qa_embeddings[0], qa_embeddings[1]))

    # Signal 3: how many docs were retrieved (more = more grounded)
    doc_factor = min(doc_count / 4.0, 1.0)

    # Weighted: doc_sim=50% | query_sim=30% | doc_factor=20%
    score = (doc_sim * 0.5) + (query_sim * 0.3) + (doc_factor * 0.2)
    return round(min(max(score, 0.0), 1.0), 4)

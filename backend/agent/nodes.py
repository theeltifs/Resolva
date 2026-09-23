from __future__ import annotations

from groq import Groq

from config import settings
from agent.state import AgentState
from rag.retriever import retrieve_docs
from agent.confidence import calculate_confidence

_groq: Groq | None = None


def _get_groq() -> Groq:
    global _groq
    if _groq is None:
        _groq = Groq(api_key=settings.groq_api_key)
    return _groq


def node_retrieve(state: AgentState) -> dict:
    docs = retrieve_docs(
        query=state["user_query"],
        company_id=state["company_id"],
        top_k=4,
    )
    return {"retrieved_docs": docs, "retrieved_doc_count": len(docs)}


def node_generate(state: AgentState) -> dict:
    context = (
        "\n\n".join(state["retrieved_docs"])
        if state["retrieved_docs"]
        else "No relevant information found in the knowledge base."
    )

    system_prompt = (
        "You are a helpful customer support agent for a company. "
        "Answer ONLY based on the provided context from the knowledge base. "
        "If the context does not contain enough information to answer confidently, "
        "say clearly: 'I don't have enough information about this topic.' "
        "Be concise, accurate, and friendly."
    )

    messages: list[dict] = [{"role": "system", "content": system_prompt}]

    # Include last 3 turns (6 messages) for multi-turn context
    for msg in state.get("conversation_history", [])[-6:]:
        messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({
        "role": "user",
        "content": (
            f"Context from knowledge base:\n{context}\n\n"
            f"Customer question: {state['user_query']}"
        ),
    })

    response = _get_groq().chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=messages,
        temperature=0.3,
        max_tokens=500,
    )
    return {"generated_answer": response.choices[0].message.content}


def node_score(state: AgentState) -> dict:
    score = calculate_confidence(
        query=state["user_query"],
        answer=state["generated_answer"],
        docs=state["retrieved_docs"],
        doc_count=state["retrieved_doc_count"],
    )
    should_escalate = score < settings.confidence_threshold
    reason = (
        f"Confidence score {score:.2f} is below threshold {settings.confidence_threshold}. "
        "Insufficient information found in the knowledge base."
        if should_escalate
        else ""
    )
    return {
        "confidence_score": score,
        "should_escalate": should_escalate,
        "escalation_reason": reason,
    }


def node_escalate(state: AgentState) -> dict:
    # Only wraps the answer — email is sent by the API layer (not here)
    wrapped = (
        "I want to make sure you get the best help possible. "
        "I've escalated your question to our support team and they'll follow up with you shortly. "
        f"In the meantime, here's what I found: {state['generated_answer']}"
    )
    return {"generated_answer": wrapped}

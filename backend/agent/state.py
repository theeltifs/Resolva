from typing import TypedDict, List


class AgentState(TypedDict):
    user_query: str
    session_id: str
    company_id: str
    conversation_history: List[dict]  # [{"role": "user"|"assistant", "content": str}]
    retrieved_docs: List[str]
    retrieved_doc_count: int
    generated_answer: str
    confidence_score: float
    should_escalate: bool
    escalation_reason: str

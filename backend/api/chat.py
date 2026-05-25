import asyncio
import uuid

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from agent.graph import support_agent
from db.database import get_db
from db import crud
from services.email_service import send_escalation_email_async

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    company_id: str = "default"


class ChatResponse(BaseModel):
    answer: str
    session_id: str
    confidence_score: float
    escalated: bool
    ticket_id: str | None = None


@router.post("/chat", response_model=ChatResponse)
@limiter.limit("20/minute")
async def chat(
    request: Request,
    body: ChatRequest,
    db: Session = Depends(get_db),
):
    session_id = body.session_id or str(uuid.uuid4())

    # Load real conversation history for multi-turn memory
    rows = crud.get_session_history(db, session_id, limit=10)
    history = [{"role": r.role, "content": r.content} for r in rows]

    initial_state = {
        "user_query": body.message,
        "session_id": session_id,
        "company_id": body.company_id,
        "conversation_history": history,
        "retrieved_docs": [],
        "retrieved_doc_count": 0,
        "generated_answer": "",
        "confidence_score": 0.0,
        "should_escalate": False,
        "escalation_reason": "",
    }

    # Run synchronous LangGraph agent off the event loop
    result = await asyncio.to_thread(support_agent.invoke, initial_state)

    ticket_id = None
    if result["should_escalate"]:
        ticket = crud.create_ticket(
            db,
            session_id=session_id,
            company_id=body.company_id,
            query=body.message,
            ai_answer=result["generated_answer"],
            reason=result["escalation_reason"],
        )
        ticket_id = ticket.id
        # Fire-and-forget — email failure must not block the response
        asyncio.create_task(
            send_escalation_email_async(
                session_id=session_id,
                company_id=body.company_id,
                user_query=body.message,
                ai_answer=result["generated_answer"],
                reason=result["escalation_reason"],
                ticket_id=ticket_id,
            )
        )

    crud.add_message(db, session_id, body.company_id, "user", body.message)
    crud.add_message(
        db,
        session_id,
        body.company_id,
        "assistant",
        result["generated_answer"],
        confidence_score=result["confidence_score"],
        escalated=result["should_escalate"],
    )

    return ChatResponse(
        answer=result["generated_answer"],
        session_id=session_id,
        confidence_score=result["confidence_score"],
        escalated=result["should_escalate"],
        ticket_id=ticket_id,
    )

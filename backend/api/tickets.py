from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.database import get_db
from db import crud

router = APIRouter()


class TicketOut(BaseModel):
    id: str
    session_id: str
    company_id: str
    original_query: str
    ai_answer: str
    escalation_reason: str | None
    status: str
    created_at: str


@router.get("/tickets", response_model=list[TicketOut])
def list_tickets(
    company_id: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    tickets = crud.get_tickets(db, company_id=company_id, status=status)
    return [
        TicketOut(
            id=t.id,
            session_id=t.session_id,
            company_id=t.company_id,
            original_query=t.original_query,
            ai_answer=t.ai_answer,
            escalation_reason=t.escalation_reason,
            status=t.status,
            created_at=t.created_at.isoformat(),
        )
        for t in tickets
    ]


@router.patch("/tickets/{ticket_id}/resolve")
def resolve_ticket(ticket_id: str, db: Session = Depends(get_db)):
    ticket = crud.resolve_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return {"id": ticket.id, "status": ticket.status}

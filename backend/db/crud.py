import uuid
from sqlalchemy.orm import Session
from sqlalchemy import func

from db.models import Message, SupportTicket


def add_message(
    db: Session,
    session_id: str,
    company_id: str,
    role: str,
    content: str,
    confidence_score: float | None = None,
    escalated: bool = False,
) -> Message:
    msg = Message(
        id=str(uuid.uuid4()),
        session_id=session_id,
        company_id=company_id,
        role=role,
        content=content,
        confidence_score=confidence_score,
        escalated=escalated,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def get_session_history(db: Session, session_id: str, limit: int = 10) -> list[Message]:
    return (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.created_at.asc())
        .limit(limit)
        .all()
    )


def create_ticket(
    db: Session,
    session_id: str,
    company_id: str,
    query: str,
    ai_answer: str,
    reason: str,
) -> SupportTicket:
    ticket = SupportTicket(
        id=str(uuid.uuid4()),
        session_id=session_id,
        company_id=company_id,
        original_query=query,
        ai_answer=ai_answer,
        escalation_reason=reason,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


def get_tickets(
    db: Session,
    company_id: str | None = None,
    status: str | None = None,
) -> list[SupportTicket]:
    q = db.query(SupportTicket)
    if company_id:
        q = q.filter(SupportTicket.company_id == company_id)
    if status:
        q = q.filter(SupportTicket.status == status)
    return q.order_by(SupportTicket.created_at.desc()).all()


def resolve_ticket(db: Session, ticket_id: str) -> SupportTicket | None:
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if ticket:
        ticket.status = "resolved"
        db.commit()
        db.refresh(ticket)
    return ticket


def get_analytics(db: Session, company_id: str | None = None) -> dict:
    mq = db.query(Message)
    tq = db.query(SupportTicket)

    if company_id:
        mq = mq.filter(Message.company_id == company_id)
        tq = tq.filter(SupportTicket.company_id == company_id)

    total = mq.filter(Message.role == "user").count()
    escalated_count = tq.count()
    resolved_count = tq.filter(SupportTicket.status == "resolved").count()

    avg_conf_query = db.query(func.avg(Message.confidence_score)).filter(
        Message.role == "assistant",
        Message.confidence_score.isnot(None),
    )
    if company_id:
        avg_conf_query = avg_conf_query.filter(Message.company_id == company_id)
    avg_confidence = avg_conf_query.scalar() or 0.0

    return {
        "total_questions": total,
        "auto_resolved": total - escalated_count,
        "escalated": escalated_count,
        "tickets_open": escalated_count - resolved_count,
        "tickets_resolved": resolved_count,
        "avg_confidence": round(float(avg_confidence), 3),
        "escalation_rate": round(escalated_count / total, 3) if total > 0 else 0.0,
    }

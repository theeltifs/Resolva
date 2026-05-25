import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, Boolean, DateTime, Text

from db.database import Base


def _uuid():
    return str(uuid.uuid4())


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=_uuid)
    session_id = Column(String, index=True, nullable=False)
    company_id = Column(String, nullable=False, index=True)
    role = Column(String, nullable=False)          # "user" or "assistant"
    content = Column(Text, nullable=False)
    confidence_score = Column(Float, nullable=True)
    escalated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class SupportTicket(Base):
    __tablename__ = "tickets"

    id = Column(String, primary_key=True, default=_uuid)
    session_id = Column(String, index=True, nullable=False)
    company_id = Column(String, nullable=False, index=True)
    original_query = Column(Text, nullable=False)
    ai_answer = Column(Text, nullable=False)
    escalation_reason = Column(Text)
    status = Column(String, default="open")        # open / resolved
    created_at = Column(DateTime, default=datetime.utcnow)

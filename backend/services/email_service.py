import asyncio

import resend

from config import settings


def send_escalation_email(
    session_id: str,
    company_id: str,
    user_query: str,
    ai_answer: str,
    reason: str,
    ticket_id: str,
) -> None:
    if not settings.resend_api_key or not settings.human_agent_email:
        return  # not configured — silently skip

    resend.api_key = settings.resend_api_key
    try:
        resend.Emails.send({
            # Resend sandbox sender — works without domain verification
            "from": "onboarding@resend.dev",
            "to": settings.human_agent_email,
            "subject": f"[Resolva] Escalated Ticket #{ticket_id[:8]} — {company_id}",
            "html": f"""
            <div style="font-family: sans-serif; max-width: 600px;">
                <h2 style="color: #7c3aed;">🚨 Escalated Support Ticket</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px; font-weight: bold; width: 120px;">Ticket ID</td>
                        <td style="padding: 6px; font-family: monospace;">{ticket_id}</td>
                    </tr>
                    <tr style="background: #f9fafb;">
                        <td style="padding: 6px; font-weight: bold;">Session</td>
                        <td style="padding: 6px; font-family: monospace;">{session_id}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px; font-weight: bold;">Company</td>
                        <td style="padding: 6px;">{company_id}</td>
                    </tr>
                </table>

                <h3 style="color: #374151; margin-top: 24px;">Customer Question</h3>
                <blockquote style="border-left: 4px solid #7c3aed; padding-left: 12px; color: #374151;">
                    {user_query}
                </blockquote>

                <h3 style="color: #374151;">AI Response (low confidence)</h3>
                <blockquote style="border-left: 4px solid #e5e7eb; padding-left: 12px; color: #6b7280;">
                    {ai_answer}
                </blockquote>

                <p style="color: #dc2626;"><strong>Escalation reason:</strong> {reason}</p>
                <p style="color: #6b7280; font-size: 13px;">
                    Please follow up with the customer directly.
                </p>
            </div>
            """,
        })
    except Exception:
        # Email failure must never break the chat response
        pass


async def send_escalation_email_async(**kwargs) -> None:
    await asyncio.to_thread(send_escalation_email, **kwargs)

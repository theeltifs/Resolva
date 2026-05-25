import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../api";
import { IconWarning, IconSend } from "./Icons";

function ConfidencePill({ score, escalated }) {
  if (escalated) {
    return (
      <span className="badge badge-warning" style={{ fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4 }}>
        <IconWarning size={12} /> Escalated
      </span>
    );
  }
  const pct = Math.round(score * 100);
  const color =
    score >= 0.75 ? "#10b981" : score >= 0.55 ? "#f59e0b" : "#ef4444";
  return (
    <span
      className="confidence-pill"
      style={{ background: `${color}18`, color }}
    >
      ● {pct}% confidence
    </span>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`chat-bubble-wrap ${isUser ? "user" : "assistant"}`}>
      <div className={`chat-bubble ${isUser ? "user" : "assistant"}`}>
        {msg.content}
      </div>
      {!isUser && (
        <div className="chat-meta">
          <ConfidencePill score={msg.confidence} escalated={msg.escalated} />
          {msg.ticketId && (
            <span
              className="mono"
              style={{ fontSize: 10, color: "var(--text-light)" }}
            >
              ticket {msg.ticketId.slice(0, 8)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="chat-bubble-wrap assistant">
      <div className="chat-bubble assistant" style={{ padding: "10px 16px" }}>
        <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--primary)",
                opacity: 0.6,
                animation: `bounce 1.2s ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </span>
        <style>{`
          @keyframes bounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-5px); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI support agent powered by Resolva. Ask me anything about your product — I'll answer from the knowledge base or escalate to a human if needed.",
      confidence: 1,
      escalated: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [companyId, setCompanyId] = useState("default");
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await sendMessage(text, sessionId, companyId);
      if (!sessionId) setSessionId(res.session_id);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.answer,
          confidence: res.confidence_score,
          escalated: res.escalated,
          ticketId: res.ticket_id,
        },
      ]);
    } catch (e) {
      setError(e.message || "Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setSessionId(null);
    setMessages([
      {
        role: "assistant",
        content: "Hi! I'm your AI support agent powered by Resolva. Ask me anything about your product — I'll answer from the knowledge base or escalate to a human if needed.",
        confidence: 1,
        escalated: false,
      },
    ]);
    setError("");
  };

  return (
    <div className="chat-layout" style={{ height: "calc(100vh - 73px)" }}>
      {/* Company selector bar */}
      <div className="chat-company-bar">
        <label>Company ID:</label>
        <input
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          placeholder="default"
          disabled={!!sessionId}
        />
        {sessionId && (
          <span
            className="mono"
            style={{ fontSize: 11, color: "var(--text-muted)" }}
          >
            session: {sessionId.slice(0, 12)}…
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button className="btn btn-outline btn-sm" onClick={handleReset}>
          New session
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{ background: "var(--bg)" }}>
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        {loading && <TypingIndicator />}
        {error && (
          <div className="alert alert-danger" style={{ maxWidth: "75%", display: "flex", alignItems: "center", gap: 8 }}>
            <IconWarning size={15} /> {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-footer">
        <textarea
          ref={inputRef}
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
          rows={1}
          disabled={loading}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          title="Send"
        >
          {loading ? <span className="spinner" /> : <IconSend size={18} />}
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { getTickets, resolveTicket } from "../api";
import { IconWarning, IconCheck, IconCheckCircle } from "./Icons";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Open", value: "open" },
  { label: "Resolved", value: "resolved" },
];

function TicketRow({ ticket, onResolve }) {
  const [resolving, setResolving] = useState(false);

  const handleResolve = async () => {
    setResolving(true);
    try {
      await onResolve(ticket.id);
    } finally {
      setResolving(false);
    }
  };

  return (
    <tr>
      <td>
        <span className="mono">{ticket.id.slice(0, 8)}</span>
      </td>
      <td>
        <span
          className={`badge ${ticket.status === "open" ? "badge-warning" : "badge-success"}`}
        >
          {ticket.status === "open"
            ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>● Open</span>
            : <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><IconCheck size={11} /> Resolved</span>
          }
        </span>
      </td>
      <td>
        <div className="td-truncate" title={ticket.original_query}>
          {ticket.original_query}
        </div>
      </td>
      <td>
        <div
          className="td-truncate"
          title={ticket.ai_answer}
          style={{ color: "var(--text-muted)", maxWidth: 200 }}
        >
          {ticket.ai_answer}
        </div>
      </td>
      <td>
        <span className="badge badge-gray">{ticket.company_id}</span>
      </td>
      <td style={{ whiteSpace: "nowrap", color: "var(--text-muted)", fontSize: 12 }}>
        {new Date(ticket.created_at).toLocaleString()}
      </td>
      <td>
        {ticket.status === "open" ? (
          <button
            className="btn btn-success"
            onClick={handleResolve}
            disabled={resolving}
          >
            {resolving
              ? <span className="spinner" />
              : <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><IconCheck size={13} /> Resolve</span>
            }
          </button>
        ) : (
          <span style={{ fontSize: 12, color: "var(--text-light)" }}>—</span>
        )}
      </td>
    </tr>
  );
}

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getTickets(companyId || undefined, status || undefined);
      setTickets(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [status, companyId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleResolve = async (id) => {
    await resolveTicket(id);
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "resolved" } : t))
    );
  };

  return (
    <div className="page-body">
      {/* Filters */}
      <div
        className="card"
        style={{
          padding: "12px 16px",
          marginBottom: 20,
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 4 }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`btn btn-sm ${status === f.value ? "btn-primary" : "btn-outline"}`}
              onClick={() => setStatus(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: "var(--border)" }} />

        <input
          className="form-input"
          style={{ maxWidth: 180 }}
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          placeholder="Filter by company…"
        />
        <button className="btn btn-outline btn-sm" onClick={load}>
          Refresh
        </button>

        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
        </span>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <IconWarning size={15} /> {error}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="empty-state">
            <span className="spinner spinner-dark" />
            <div style={{ marginTop: 10 }}>Loading tickets…</div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><IconCheckCircle size={32} /></div>
            <div className="empty-state-title">No tickets found</div>
            <div className="empty-state-sub">
              {status === "open"
                ? "All escalated conversations have been resolved."
                : "No escalated tickets yet. The AI is handling everything!"}
            </div>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Question</th>
                  <th>AI Answer</th>
                  <th>Company</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <TicketRow key={t.id} ticket={t} onResolve={handleResolve} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

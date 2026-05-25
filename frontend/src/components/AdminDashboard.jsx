import { useState, useEffect, useCallback } from "react";
import { getAnalytics } from "../api";
import {
  IconChat,
  IconCheckCircle,
  IconAlertCircle,
  IconTarget,
  IconWarning,
  IconInbox,
  IconDotFilled,
} from "./Icons";

const STAT_CARDS = [
  {
    key: "total_questions",
    label: "Total Questions",
    Icon: IconChat,
    color: "#3b82f6",
    bg: "#eff6ff",
    format: (v) => v,
    sub: (d) => `${d.auto_resolved} auto-resolved`,
  },
  {
    key: "auto_resolved",
    label: "Auto Resolved",
    Icon: IconCheckCircle,
    color: "#10b981",
    bg: "#d1fae5",
    format: (v) => v,
    sub: (d) =>
      d.total_questions > 0
        ? `${Math.round((d.auto_resolved / d.total_questions) * 100)}% of total`
        : "—",
  },
  {
    key: "escalated",
    label: "Escalated",
    Icon: IconAlertCircle,
    color: "#f59e0b",
    bg: "#fef3c7",
    format: (v) => v,
    sub: (d) => `${d.tickets_open} open · ${d.tickets_resolved} resolved`,
  },
  {
    key: "avg_confidence",
    label: "Avg Confidence",
    Icon: IconTarget,
    color: "#7c3aed",
    bg: "#ede9fe",
    format: (v) => `${Math.round(v * 100)}%`,
    sub: () => "across all responses",
  },
];

function BarRow({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 5,
          fontSize: 13,
        }}
      >
        <span style={{ fontWeight: 500 }}>{label}</span>
        <span style={{ color: "var(--text-muted)" }}>
          {value} ({pct}%)
        </span>
      </div>
      <div className="progress-bar-wrap">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [companyId, setCompanyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAnalytics(companyId || undefined);
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="page-body">
      {/* Filter bar */}
      <div
        className="card"
        style={{ padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}
      >
        <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
          Filter by company:
        </label>
        <input
          className="form-input"
          style={{ maxWidth: 200 }}
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          placeholder="All companies"
        />
        <button className="btn btn-primary btn-sm" onClick={load}>
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <IconWarning size={15} /> {error}
        </div>
      )}

      {loading && !data ? (
        <div className="empty-state">
          <div style={{ marginBottom: 10 }}>
            <span className="spinner spinner-dark" />
          </div>
          <div>Loading analytics…</div>
        </div>
      ) : data ? (
        <>
          {/* Stat cards */}
          <div className="stat-grid">
            {STAT_CARDS.map((card) => (
              <div className="stat-card" key={card.key}>
                <div
                  className="stat-icon"
                  style={{
                    width: 38,
                    height: 38,
                    background: card.bg,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                    color: card.color,
                  }}
                >
                  <card.Icon size={19} />
                </div>
                <div className="stat-label">{card.label}</div>
                <div className="stat-value" style={{ color: card.color }}>
                  {card.format(data[card.key])}
                </div>
                <div className="stat-sub">{card.sub(data)}</div>
              </div>
            ))}
          </div>

          {/* Resolution breakdown */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">Resolution Breakdown</div>
            <div className="card-body">
              {data.total_questions === 0 ? (
                <div className="empty-state" style={{ padding: "24px 0" }}>
                  <div className="empty-state-icon">
                    <IconInbox size={32} />
                  </div>
                  <div className="empty-state-title">No data yet</div>
                  <div className="empty-state-sub">
                    Start chatting to see analytics here.
                  </div>
                </div>
              ) : (
                <>
                  <BarRow
                    label="Auto-resolved by AI"
                    value={data.auto_resolved}
                    max={data.total_questions}
                    color="#10b981"
                  />
                  <BarRow
                    label="Escalated to human"
                    value={data.escalated}
                    max={data.total_questions}
                    color="#f59e0b"
                  />
                </>
              )}
            </div>
          </div>

          {/* Ticket status */}
          <div className="card">
            <div className="card-header">Ticket Status</div>
            <div className="card-body">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                {[
                  { label: "Open Tickets",     value: data.tickets_open,     dotColor: "#f59e0b" },
                  { label: "Resolved Tickets",  value: data.tickets_resolved, dotColor: "#10b981" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: "16px",
                      background: "var(--bg)",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <IconDotFilled color={item.dotColor} size={12} />
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>
                        {item.value}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                        {item.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 16,
                  padding: "10px 14px",
                  background: "var(--primary-light)",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "var(--primary-dark)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Escalation rate</span>
                <strong>{Math.round(data.escalation_rate * 100)}%</strong>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

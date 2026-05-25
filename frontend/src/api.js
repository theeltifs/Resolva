const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const sendMessage = (message, sessionId, companyId = "default") =>
  request("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      session_id: sessionId || undefined,
      company_id: companyId,
    }),
  });

export const uploadFile = (file, companyId) => {
  const form = new FormData();
  form.append("file", file);
  return request(`/upload?company_id=${encodeURIComponent(companyId)}`, {
    method: "POST",
    headers: { "x-api-key": import.meta.env.VITE_UPLOAD_API_KEY || "" },
    body: form,
  });
};

export const getTickets = (companyId, status) => {
  const params = new URLSearchParams();
  if (companyId) params.set("company_id", companyId);
  if (status) params.set("status", status);
  const qs = params.toString();
  return request(`/tickets${qs ? `?${qs}` : ""}`);
};

export const resolveTicket = (id) =>
  request(`/tickets/${id}/resolve`, { method: "PATCH" });

export const getAnalytics = (companyId) => {
  const qs = companyId ? `?company_id=${encodeURIComponent(companyId)}` : "";
  return request(`/analytics${qs}`);
};

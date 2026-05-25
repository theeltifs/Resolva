import { useState } from "react";
import ChatWidget from "./components/ChatWidget";
import AdminDashboard from "./components/AdminDashboard";
import TicketList from "./components/TicketList";
import UploadKB from "./components/UploadKB";
import {
  IconBolt,
  IconChat,
  IconBarChart,
  IconTicket,
  IconUploadCloud,
} from "./components/Icons";

const NAV = [
  { id: "chat",      label: "Chat",       icon: <IconChat />,        subtitle: "Test your support agent" },
  { id: "dashboard", label: "Dashboard",  icon: <IconBarChart />,    subtitle: "Analytics overview" },
  { id: "tickets",   label: "Tickets",    icon: <IconTicket />,      subtitle: "Escalated conversations" },
  { id: "upload",    label: "Upload KB",  icon: <IconUploadCloud />, subtitle: "Manage knowledge base" },
];

export default function App() {
  const [active, setActive] = useState("chat");
  const current = NAV.find((n) => n.id === active);

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <IconBolt size={20} />
          </div>
          <div>
            <div className="sidebar-logo-text">Resolva</div>
            <div className="sidebar-logo-tag">AI Support Agent</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((item) => (
            <button
              key={item.id}
              className={`nav-item${active === item.id ? " active" : ""}`}
              onClick={() => setActive(item.id)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">Resolva v1.0.0 · Free Stack</div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="page-header">
          <div>
            <div className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="page-title-icon">{current?.icon}</span>
              {current?.label}
            </div>
            <div className="page-subtitle">{current?.subtitle}</div>
          </div>
        </header>

        {active === "chat"      && <ChatWidget />}
        {active === "dashboard" && <AdminDashboard />}
        {active === "tickets"   && <TicketList />}
        {active === "upload"    && <UploadKB />}
      </div>
    </div>
  );
}

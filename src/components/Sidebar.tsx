import { useTranslation } from "react-i18next";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { t } = useTranslation();

  const menuItems = [
    { id: "dashboard", label: t("nav.dashboard"), icon: "📊" },
    { id: "accounts", label: t("nav.accounts"), icon: "👥" },
    { id: "settings", label: t("nav.settings"), icon: "⚙️" },
    { id: "about", label: t("nav.about"), icon: "ℹ️" },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">🚀</span>
        <span className="logo-text">Trae Auto</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`sidebar-item ${currentPage === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="version">v1.0.0</span>
      </div>
    </aside>
  );
}

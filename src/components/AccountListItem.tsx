import { useTranslation } from "react-i18next";
import type { UsageSummary } from "../types";

interface AccountListItemProps {
  account: {
    id: string;
    name: string;
    email: string;
    avatar_url: string;
    plan_type: string;
    created_at: number;
  };
  usage: UsageSummary | null;
  selected: boolean;
  onSelect: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
}

export function AccountListItem({ account, usage, selected, onSelect, onContextMenu }: AccountListItemProps) {
  const { t } = useTranslation();
  const totalUsed = usage ? usage.fast_request_used + usage.extra_fast_request_used : 0;
  const totalLimit = usage ? usage.fast_request_limit + usage.extra_fast_request_limit : 0;
  const totalLeft = usage ? usage.fast_request_left + usage.extra_fast_request_left : 0;
  const usagePercent = totalLimit > 0 ? Math.round((totalUsed / totalLimit) * 100) : 0;

  const getUsageColor = () => {
    if (usagePercent >= 80) return "var(--danger)";
    if (usagePercent >= 50) return "var(--warning)";
    return "var(--success)";
  };

  const formatCreatedDate = (timestamp: number) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t("common.today") || "Today";
    if (diffDays === 1) return t("common.yesterday") || "Yesterday";
    if (diffDays < 7) return t("common.days_ago", { count: diffDays }) || `${diffDays} days ago`;
    if (diffDays < 30) return t("common.weeks_ago", { count: Math.floor(diffDays / 7) }) || `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return t("common.months_ago", { count: Math.floor(diffDays / 30) }) || `${Math.floor(diffDays / 30)} months ago`;
    return t("common.years_ago", { count: Math.floor(diffDays / 365) }) || `${Math.floor(diffDays / 365)} years ago`;
  };

  const isTokenExpired = false; // TODO: 根据实际 token 过期时间判断

  return (
    <div
      className={`account-list-item ${selected ? "selected" : ""}`}
      onClick={() => onSelect(account.id)}
      onContextMenu={(e) => onContextMenu(e, account.id)}
    >
      <div className="list-item-checkbox" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(account.id)}
        />
      </div>

      <div className="list-item-avatar">
        {account.avatar_url ? (
          <img src={account.avatar_url} alt={account.name} />
        ) : (
          <div className="avatar-placeholder">
            {(account.email || account.name).charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="list-item-info">
        <span className="list-item-email">{account.email || account.name}</span>
        <span className="list-item-id">{t("accounts.trae_account")}</span>
      </div>

      <div className="list-item-plan">
        <span className="plan-badge">{usage?.plan_type || account.plan_type || "Free"}</span>
        {usage && usage.extra_fast_request_limit > 0 && (
          <span className="extra-badge">{t("accounts.gift") || "Gift"}</span>
        )}
      </div>

      <div className="list-item-usage">
        <div className="usage-info">
          <span className="usage-text">
            <strong>{Math.round(totalUsed)}</strong> / {totalLimit}
          </span>
          <span className="usage-left">{t("accounts.remaining")} {Math.round(totalLeft)}</span>
        </div>
        <div className="usage-bar-mini">
          <div
            className="usage-bar-fill-mini"
            style={{ width: `${Math.min(usagePercent, 100)}%`, background: getUsageColor() }}
          />
        </div>
      </div>

      <div className="list-item-reset">
        <span className="reset-label">{t("accounts.added_at")}</span>
        <span className="reset-date">{formatCreatedDate(account.created_at)}</span>
      </div>

      <div className="list-item-status">
        <span className={`status-dot ${isTokenExpired ? "expired" : "normal"}`}></span>
        <span>{isTokenExpired ? t("accounts.expired") : t("accounts.normal")}</span>
      </div>

      <div className="list-item-actions">
        <button
          className="action-btn"
          title={t("accounts.more_ops") || "More Operations"}
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(e, account.id);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

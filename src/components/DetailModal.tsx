import { useTranslation } from "react-i18next";
import type { Account, UsageSummary } from "../types";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  usage: UsageSummary | null;
}

export function DetailModal({ isOpen, onClose, account, usage }: DetailModalProps) {
  const { t } = useTranslation();
  if (!isOpen || !account) return null;

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "-";
    return new Date(timestamp * 1000).toLocaleString("zh-CN");
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t("accounts.view_detail")}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body detail-body">
          {/* User Profile */}
          <div className="detail-profile">
            <div className="detail-avatar">
              {account.avatar_url ? (
                <img src={account.avatar_url} alt="" />
              ) : (
                <div className="avatar-placeholder">{account.name?.[0].toUpperCase() || "T"}</div>
              )}
            </div>
            <div className="detail-user-info">
              <h3>{account.name || t("accounts.trae_account")}</h3>
              <p>{account.email}</p>
            </div>
          </div>

          <div className="detail-grid">
            {/* Basic Info */}
            <div className="detail-section">
              <h4>{t("accounts.basic_info")}</h4>
              <div className="detail-item">
                <span className="detail-label">{t("accounts.username")}</span>
                <span className="detail-value">{account.name || "-"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">{t("accounts.email_label")}</span>
                <span className="detail-value">{account.email || "-"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">{t("accounts.plan")}</span>
                <span className="detail-value">{usage?.plan_type || account.plan_type || "Free"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">{t("accounts.added_at")}</span>
                <span className="detail-value">{new Date(account.created_at).toLocaleString()}</span>
              </div>
            </div>

            {/* Fast Request Usage */}
            <div className="detail-section">
              <h4>Fast Requests {t("accounts.usage")}</h4>
              <div className="detail-item">
                <span className="detail-label">{t("dashboard.total_quota")}</span>
                <span className="detail-value">{usage ? usage.fast_request_limit + usage.extra_fast_request_limit : "-"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">{t("dashboard.used")}</span>
                <span className="detail-value">{usage ? usage.fast_request_used + usage.extra_fast_request_used : "-"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">{t("accounts.remaining")}</span>
                <span className="detail-value highlight">{usage ? usage.fast_request_left + usage.extra_fast_request_left : "-"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">{t("accounts.reset_time")}</span>
                <span className="detail-value">{usage ? new Date(usage.reset_time).toLocaleString() : "-"}</span>
              </div>
            </div>

            {/* Extra Gift */}
            {usage && usage.extra_fast_request_limit > 0 && (
              <div className="detail-section">
                <h4>{t("accounts.extra_gift")}</h4>
                <div className="detail-item">
                  <span className="detail-label">{t("accounts.gift")} Fast Requests</span>
                  <span className="detail-value">{usage.extra_fast_request_limit}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{t("accounts.gift_expired")}</span>
                  <span className="detail-value">{new Date(usage.extra_expire_time).toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Other Quotas */}
            <div className="detail-section column-span-full">
              <h4>{t("accounts.other_quota")}</h4>
              <div className="quotas-mini-grid">
                <div className="quota-mini-item">
                  <span className="quota-mini-label">{t("accounts.slow_request")}</span>
                  <span className="quota-mini-value">{usage ? usage.slow_request_left : "-"} / {usage ? usage.slow_request_limit : "-"}</span>
                </div>
                <div className="quota-mini-item">
                  <span className="quota-mini-label">{t("accounts.advanced_model")}</span>
                  <span className="quota-mini-value">{usage ? usage.advanced_model_left : "-"} / {usage ? usage.advanced_model_limit : "-"}</span>
                </div>
                <div className="quota-mini-item">
                  <span className="quota-mini-label">{t("accounts.autocomplete")}</span>
                  <span className="quota-mini-value">{usage ? usage.auto_complete_left : "-"} / {usage ? usage.auto_complete_limit : "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn-secondary" onClick={onClose}>{t("common.close")}</button>
        </div>
      </div>
    </div>
  );
}

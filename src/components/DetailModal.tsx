import type { UsageSummary } from "../types";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: {
    id: string;
    name: string;
    email: string;
    avatar_url: string;
    plan_type: string;
  } | null;
  usage: UsageSummary | null;
}

export function DetailModal({ isOpen, onClose, account, usage }: DetailModalProps) {
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
        <h2>账号详情</h2>

        <div className="detail-section">
          <h3>基本信息</h3>
          <div className="detail-row">
            <span className="detail-label">用户名</span>
            <span className="detail-value">{account.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">邮箱</span>
            <span className="detail-value">{account.email || "-"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">套餐类型</span>
            <span className="detail-value">{usage?.plan_type || account.plan_type || "Free"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">重置时间</span>
            <span className="detail-value">{usage ? formatDate(usage.reset_time) : "-"}</span>
          </div>
        </div>

        {usage && (
          <>
            <div className="detail-section">
              <h3>Fast Request</h3>
              <div className="detail-row">
                <span className="detail-label">已使用</span>
                <span className="detail-value">{formatNumber(usage.fast_request_used)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">总配额</span>
                <span className="detail-value">{formatNumber(usage.fast_request_limit)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">剩余</span>
                <span className="detail-value success">{formatNumber(usage.fast_request_left)}</span>
              </div>
            </div>

            {usage.extra_fast_request_limit > 0 && (
              <div className="detail-section">
                <h3>额外礼包 {usage.extra_package_name && `(${usage.extra_package_name})`}</h3>
                <div className="detail-row">
                  <span className="detail-label">已使用</span>
                  <span className="detail-value">{formatNumber(usage.extra_fast_request_used)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">总配额</span>
                  <span className="detail-value">{formatNumber(usage.extra_fast_request_limit)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">剩余</span>
                  <span className="detail-value success">{formatNumber(usage.extra_fast_request_left)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">过期时间</span>
                  <span className="detail-value">{formatDate(usage.extra_expire_time)}</span>
                </div>
              </div>
            )}

            <div className="detail-section">
              <h3>其他配额</h3>
              <div className="detail-row">
                <span className="detail-label">Slow Request</span>
                <span className="detail-value">
                  {formatNumber(usage.slow_request_used)} / {formatNumber(usage.slow_request_limit)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Advanced Model</span>
                <span className="detail-value">
                  {formatNumber(usage.advanced_model_used)} / {formatNumber(usage.advanced_model_limit)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Autocomplete</span>
                <span className="detail-value">
                  {formatNumber(usage.autocomplete_used)} / {formatNumber(usage.autocomplete_limit)}
                </span>
              </div>
            </div>
          </>
        )}

        <div className="modal-actions">
          <button onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
}

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from "react-i18next";
import type { UsageSummary } from "../types";
import { UsageEvents } from "../components/UsageEvents";

interface DashboardProps {
  accounts: Array<{
    id: string;
    name: string;
    email: string;
    usage?: UsageSummary | null;
    is_current?: boolean;
  }>;
}

export function Dashboard({ accounts }: DashboardProps) {
  const { t } = useTranslation();
  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter(a => a.usage && a.usage.fast_request_left > 0).length;

  const totalUsed = accounts.reduce((sum, a) => {
    if (!a.usage) return sum;
    return sum + a.usage.fast_request_used + a.usage.extra_fast_request_used;
  }, 0);

  const totalLimit = accounts.reduce((sum, a) => {
    if (!a.usage) return sum;
    return sum + a.usage.fast_request_limit + a.usage.extra_fast_request_limit;
  }, 0);

  const totalLeft = accounts.reduce((sum, a) => {
    if (!a.usage) return sum;
    return sum + a.usage.fast_request_left + a.usage.extra_fast_request_left;
  }, 0);

  const usagePercent = totalLimit > 0 ? Math.round((totalUsed / totalLimit) * 100) : 0;

  const pieData = [
    { name: t('dashboard.used'), value: totalUsed, color: '#6366f1' },
    { name: t('dashboard.available'), value: totalLeft, color: '#e5e7eb' },
  ];


  // 配额分布
  const quotaData = accounts.reduce((acc, a) => {
    if (!a.usage) return acc;
    const planType = a.usage.plan_type || 'Free';
    const existing = acc.find(item => item.name === planType);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: planType, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>{t('dashboard.welcome')} 👋</h1>
          <p>{t('dashboard.overview')}</p>
        </div>
        <div className="header-stats">
          <div className="quick-stat">
            <span className="quick-stat-value">{totalAccounts}</span>
            <span className="quick-stat-label">{t('dashboard.total_accounts')}</span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-value success">{activeAccounts}</span>
            <span className="quick-stat-label">{t('dashboard.active_accounts')}</span>
          </div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card gradient-purple">
          <div className="stat-card-content">
            <div className="stat-card-info">
              <span className="stat-card-label">{t('dashboard.total_quota')}</span>
              <span className="stat-card-value">{totalLimit}</span>
              <span className="stat-card-change">Fast Requests</span>
            </div>
            <div className="stat-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card gradient-blue">
          <div className="stat-card-content">
            <div className="stat-card-info">
              <span className="stat-card-label">{t('dashboard.used')}</span>
              <span className="stat-card-value">{Math.round(totalUsed)}</span>
              <span className="stat-card-change">{usagePercent}% {t('dashboard.usage_rate')}</span>
            </div>
            <div className="stat-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card gradient-green">
          <div className="stat-card-content">
            <div className="stat-card-info">
              <span className="stat-card-label">{t('dashboard.available')}</span>
              <span className="stat-card-value">{Math.round(totalLeft)}</span>
              <span className="stat-card-change">{100 - usagePercent}% {t('dashboard.remaining_percent')}</span>
            </div>
            <div className="stat-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card gradient-orange">
          <div className="stat-card-content">
            <div className="stat-card-info">
              <span className="stat-card-label">{t('dashboard.average_usage')}</span>
              <span className="stat-card-value">{totalAccounts > 0 ? Math.round(totalUsed / totalAccounts) : 0}</span>
              <span className="stat-card-change">{t('dashboard.per_account')}</span>
            </div>
            <div className="stat-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid-2col">
        <div className="chart-card">
          <div className="chart-header">
            <h3>{t('dashboard.usage_distribution')}</h3>
            <span className="chart-badge">{usagePercent}%</span>
          </div>
          <div className="chart-body pie-chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-center-text">
              <span className="pie-value">{Math.round(totalLeft)}</span>
              <span className="pie-label">{t('dashboard.available')}</span>
            </div>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#6366f1' }}></span>
              <span>{t('dashboard.used')} ({Math.round(totalUsed)})</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#e5e7eb' }}></span>
              <span>{t('dashboard.available')} ({Math.round(totalLeft)})</span>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>{t('dashboard.plan_distribution')}</h3>
          </div>
          <div className="chart-body">
            {quotaData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={quotaData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {quotaData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">{t('dashboard.no_data')}</div>
            )}
          </div>
        </div>
      </div>

      {accounts.length > 0 && (
        <>
          <UsageEvents accountId={accounts.find(a => a.is_current)?.id || accounts[0]?.id || ''} />

          <div className="accounts-preview">
            <div className="preview-header">
              <h3>{t('dashboard.account_overview')}</h3>
              <span className="preview-count">{t('accounts.count', { count: accounts.length })}</span>
            </div>
            <div className="preview-list">
              {accounts.slice(0, 4).map((account) => {
                const used = account.usage ? account.usage.fast_request_used + account.usage.extra_fast_request_used : 0;
                const limit = account.usage ? account.usage.fast_request_limit + account.usage.extra_fast_request_limit : 0;
                const percent = limit > 0 ? Math.round((used / limit) * 100) : 0;

                return (
                  <div key={account.id} className="preview-item">
                    <div className="preview-avatar">
                      {(account.email || account.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="preview-info">
                      <span className="preview-name">{account.email || account.name || 'Unknown'}</span>
                      <span className="preview-plan">{account.usage?.plan_type || 'Free'}</span>
                    </div>
                    <div className="preview-usage">
                      <div className="preview-progress">
                        <div
                          className="preview-progress-fill"
                          style={{
                            width: `${percent}%`,
                            background: percent > 80 ? '#ef4444' : percent > 50 ? '#f59e0b' : '#10b981'
                          }}
                        />
                      </div>
                      <span className="preview-percent">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {accounts.length === 0 && (
        <div className="dashboard-empty">
          <div className="empty-icon">📊</div>
          <h3>{t('accounts.no_accounts')}</h3>
          <p>{t('dashboard.no_data_desc')}</p>
        </div>
      )}
    </div>
  );
}

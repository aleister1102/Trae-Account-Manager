import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Sidebar } from "./components/Sidebar";
import { AccountCard } from "./components/AccountCard";
import { AccountListItem } from "./components/AccountListItem";
import { AddAccountModal } from "./components/AddAccountModal";
import { ContextMenu } from "./components/ContextMenu";
import { DetailModal } from "./components/DetailModal";
import { Toast, ToastMessage } from "./components/Toast";
import { ConfirmModal } from "./components/ConfirmModal";
import { UpdateTokenModal } from "./components/UpdateTokenModal";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { About } from "./pages/About";
import * as api from "./api";
import type { AccountBrief, UsageSummary } from "./types";
import "./App.css";

interface AccountWithUsage extends AccountBrief {
  usage?: UsageSummary | null;
}

type ViewMode = "grid" | "list";

function App() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<AccountWithUsage[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Toast 通知状态
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 确认弹窗状态
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "danger" | "warning" | "info";
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    accountId: string;
  } | null>(null);

  // 详情弹窗状态
  const [detailAccount, setDetailAccount] = useState<AccountWithUsage | null>(null);

  // 刷新中的账号 ID
  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());

  // 更新 Token 弹窗状态
  const [updateTokenModal, setUpdateTokenModal] = useState<{
    accountId: string;
    accountName: string;
  } | null>(null);

  // 添加 Toast 通知
  const addToast = useCallback((type: ToastMessage["type"], message: string, duration?: number) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  // 移除 Toast 通知
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 加载账号列表
  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.getAccounts();
      // 为每个账号加载使用量
      const accountsWithUsage: AccountWithUsage[] = await Promise.all(
        list.map(async (account) => {
          try {
            const usage = await api.getAccountUsage(account.id);
            return { ...account, usage };
          } catch {
            return { ...account, usage: null };
          }
        })
      );
      setAccounts(accountsWithUsage);
    } catch (err: any) {
      setError(err.message || t("accounts.load_failed"));
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // 添加账号
  const handleAddAccount = async (token: string, cookies?: string) => {
    await api.addAccountByToken(token, cookies);
    addToast("success", t("accounts.add_success"));
    await loadAccounts();
  };

  // 删除账号
  const handleDeleteAccount = async (accountId: string) => {
    setConfirmModal({
      isOpen: true,
      title: t("accounts.delete_confirm_title"),
      message: t("accounts.delete_confirm_msg"),
      type: "danger",
      onConfirm: async () => {
        try {
          await api.removeAccount(accountId);
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(accountId);
            return next;
          });
          addToast("success", t("accounts.delete_success"));
          await loadAccounts();
        } catch (err: any) {
          addToast("error", err.message || t("accounts.delete_failed"));
        }
        setConfirmModal(null);
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  // 刷新单个账号
  const handleRefreshAccount = async (accountId: string) => {
    // 防止重复刷新
    if (refreshingIds.has(accountId)) {
      return;
    }

    setRefreshingIds((prev) => new Set(prev).add(accountId));

    try {
      const usage = await api.getAccountUsage(accountId);
      setAccounts((prev) =>
        prev.map((a) => (a.id === accountId ? { ...a, usage } : a))
      );
      addToast("success", t("accounts.refresh_success"));
    } catch (err: any) {
      addToast("error", err.message || t("accounts.refresh_failed"));
    } finally {
      setRefreshingIds((prev) => {
        const next = new Set(prev);
        next.delete(accountId);
        return next;
      });
    }
  };

  // 选择账号
  const handleSelectAccount = (accountId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedIds.size === accounts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(accounts.map((a) => a.id)));
    }
  };

  // 右键菜单
  const handleContextMenu = (e: React.MouseEvent, accountId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, accountId });
  };

  // 复制 Token
  const handleCopyToken = async (accountId: string) => {
    try {
      const account = await api.getAccount(accountId);
      if (account.jwt_token) {
        await navigator.clipboard.writeText(account.jwt_token);
        addToast("success", t("accounts.copy_token_success"));
      } else {
        addToast("warning", t("accounts.no_token_warning"));
      }
    } catch (err: any) {
      addToast("error", err.message || t("accounts.get_token_failed"));
    }
  };

  // 切换账号
  const handleSwitchAccount = async (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    if (!account) return;

    setConfirmModal({
      isOpen: true,
      title: t("accounts.switch_confirm_title"),
      message: t("accounts.switch_confirm_msg", { name: account.email || account.name }),
      type: "warning",
      onConfirm: async () => {
        setConfirmModal(null);
        addToast("info", t("accounts.switching"));
        try {
          await api.switchAccount(accountId);
          await loadAccounts();
          addToast("success", t("accounts.switch_success"));
        } catch (err: any) {
          addToast("error", err.message || t("accounts.switch_failed"));
        }
      },
    });
  };

  // 查看详情
  const handleViewDetail = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    if (account) {
      setDetailAccount(account);
    }
  };

  // 更新 Token
  const handleUpdateToken = async (accountId: string, token: string) => {
    try {
      const usage = await api.updateAccountToken(accountId, token);
      setAccounts((prev) =>
        prev.map((a) => (a.id === accountId ? { ...a, usage } : a))
      );
      addToast("success", t("accounts.update_token_success"));
    } catch (err: any) {
      throw err; // 让弹窗显示错误
    }
  };

  // 打开更新 Token 弹窗
  const handleOpenUpdateToken = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    if (account) {
      setUpdateTokenModal({
        accountId,
        accountName: account.email || account.name,
      });
    }
  };

  // 获取礼包
  const handleClaimGift = async (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    if (!account) return;

    setConfirmModal({
      isOpen: true,
      title: t("accounts.claim_gift_confirm_title"),
      message: t("accounts.claim_gift_confirm_msg", { name: account.email || account.name }),
      type: "info",
      onConfirm: async () => {
        setConfirmModal(null);
        addToast("info", t("accounts.claiming_gift"));
        try {
          await api.claimGift(accountId);
          // 刷新账号数据
          await handleRefreshAccount(accountId);
          addToast("success", t("accounts.claim_gift_success"));
        } catch (err: any) {
          addToast("error", err.message || t("accounts.claim_gift_failed"));
        }
      },
    });
  };

  // 导出账号
  const handleExportAccounts = async () => {
    try {
      const data = await api.exportAccounts();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `trae-accounts-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast("success", t("accounts.export_success", { count: accounts.length }));
    } catch (err: any) {
      addToast("error", err.message || t("accounts.export_failed"));
    }
  };

  // 导入账号
  const handleImportAccounts = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const count = await api.importAccounts(text);
        addToast("success", t("accounts.import_success", { count }));
        await loadAccounts();
      } catch (err: any) {
        addToast("error", err.message || t("accounts.import_failed"));
      }
    };
    input.click();
  };

  // 批量刷新选中账号
  const handleBatchRefresh = async () => {
    if (selectedIds.size === 0) {
      addToast("warning", t("accounts.select_to_refresh"));
      return;
    }

    addToast("info", t("accounts.refreshing_batch", { count: selectedIds.size }));

    for (const id of selectedIds) {
      await handleRefreshAccount(id);
    }
  };

  // 批量删除选中账号
  const handleBatchDelete = () => {
    if (selectedIds.size === 0) {
      addToast("warning", t("accounts.select_to_delete"));
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: t("accounts.batch_delete_confirm_title"),
      message: t("accounts.batch_delete_confirm_msg", { count: selectedIds.size }),
      type: "danger",
      onConfirm: async () => {
        try {
          for (const id of selectedIds) {
            await api.removeAccount(id);
          }
          setSelectedIds(new Set());
          addToast("success", t("accounts.batch_delete_success", { count: selectedIds.size }));
          await loadAccounts();
        } catch (err: any) {
          addToast("error", err.message || t("accounts.batch_delete_failed"));
        }
        setConfirmModal(null);
      },
    });
  };

  return (
    <div className="app">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="app-content">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {currentPage === "dashboard" && (
          <Dashboard accounts={accounts} />
        )}

        {currentPage === "accounts" && (
          <>
            <header className="page-header">
              <div className="header-left">
                <h2 className="page-title">{t("accounts.management")}</h2>
                <p>{t("accounts.management_desc")}</p>
              </div>
              <div className="header-right">
                <span className="account-count">{t("accounts.count", { count: accounts.length })}</span>
                <button className="header-btn" onClick={handleImportAccounts} title={t("common.import")}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  {t("common.import")}
                </button>
                <button className="header-btn" onClick={handleExportAccounts} title={t("common.export")} disabled={accounts.length === 0}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  {t("common.export")}
                </button>
                <button className="add-btn" onClick={() => setShowAddModal(true)}>
                  <span>+</span> {t("accounts.add_account_title")}
                </button>
              </div>
            </header>

            <main className="app-main">
              {accounts.length > 0 && (
                <div className="toolbar">
                  <div className="toolbar-left">
                    <label className="select-all">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === accounts.length && accounts.length > 0}
                        onChange={handleSelectAll}
                      />
                      全选 ({selectedIds.size}/{accounts.length})
                    </label>
                    {selectedIds.size > 0 && (
                      <div className="batch-actions">
                        <button className="batch-btn" onClick={handleBatchRefresh}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                          </svg>
                          刷新
                        </button>
                        <button className="batch-btn danger" onClick={handleBatchDelete}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          删除
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="toolbar-right">
                    <div className="view-toggle">
                      <button
                        className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                        onClick={() => setViewMode("grid")}
                        title={t("common.grid_view")}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                        </svg>
                      </button>
                      <button
                        className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                        onClick={() => setViewMode("list")}
                        title={t("common.list_view")}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <line x1="8" y1="6" x2="21" y2="6" />
                          <line x1="8" y1="12" x2="21" y2="12" />
                          <line x1="8" y1="18" x2="21" y2="18" />
                          <line x1="3" y1="6" x2="3.01" y2="6" />
                          <line x1="3" y1="12" x2="3.01" y2="12" />
                          <line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>{t("common.loading")}</p>
                </div>
              ) : accounts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3>{t("accounts.no_accounts")}</h3>
                  <p>{t("accounts.no_accounts_desc")}</p>
                  <div className="empty-actions">
                    <button className="empty-btn primary" onClick={() => setShowAddModal(true)}>
                      {t("accounts.add_account_title")}
                    </button>
                    <button className="empty-btn" onClick={handleImportAccounts}>
                      {t("common.import")}
                    </button>
                  </div>
                </div>
              ) : viewMode === "grid" ? (
                <div className="account-grid">
                  {accounts.map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      usage={account.usage || null}
                      selected={selectedIds.has(account.id)}
                      onSelect={handleSelectAccount}
                      onContextMenu={handleContextMenu}
                    />
                  ))}
                </div>
              ) : (
                <div className="account-list">
                  <div className="list-header">
                    <div className="list-col checkbox"></div>
                    <div className="list-col avatar"></div>
                    <div className="list-col info">{t("accounts.info")}</div>
                    <div className="list-col plan">{t("accounts.plan")}</div>
                    <div className="list-col usage">{t("accounts.usage")}</div>
                    <div className="list-col reset">{t("accounts.reset_time")}</div>
                    <div className="list-col status">{t("accounts.status")}</div>
                    <div className="list-col actions"></div>
                  </div>
                  {accounts.map((account) => (
                    <AccountListItem
                      key={account.id}
                      account={account}
                      usage={account.usage || null}
                      selected={selectedIds.has(account.id)}
                      onSelect={handleSelectAccount}
                      onContextMenu={handleContextMenu}
                    />
                  ))}
                </div>
              )}
            </main>
          </>
        )}

        {currentPage === "settings" && <Settings onToast={addToast} />}

        {currentPage === "about" && <About />}
      </div>

      {/* Toast 通知 */}
      <Toast messages={toasts} onRemove={removeToast} />

      {/* 确认弹窗 */}
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          confirmText={t("common.confirm")}
          cancelText={t("common.cancel")}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* 右键菜单 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onViewDetail={() => {
            handleViewDetail(contextMenu.accountId);
            setContextMenu(null);
          }}
          onRefresh={() => {
            handleRefreshAccount(contextMenu.accountId);
            setContextMenu(null);
          }}
          onUpdateToken={() => {
            handleOpenUpdateToken(contextMenu.accountId);
            setContextMenu(null);
          }}
          onCopyToken={() => {
            handleCopyToken(contextMenu.accountId);
            setContextMenu(null);
          }}
          onSwitch={() => {
            handleSwitchAccount(contextMenu.accountId);
            setContextMenu(null);
          }}
          onClaimGift={() => {
            handleClaimGift(contextMenu.accountId);
            setContextMenu(null);
          }}
          onDelete={() => {
            handleDeleteAccount(contextMenu.accountId);
            setContextMenu(null);
          }}
          isCurrent={accounts.find(a => a.id === contextMenu.accountId)?.is_current || false}
        />
      )}

      {/* 添加账号弹窗 */}
      <AddAccountModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddAccount}
        onToast={addToast}
        onAccountAdded={loadAccounts}
      />

      {/* 详情弹窗 */}
      <DetailModal
        isOpen={!!detailAccount}
        onClose={() => setDetailAccount(null)}
        account={detailAccount}
        usage={detailAccount?.usage || null}
      />

      {/* 更新 Token 弹窗 */}
      <UpdateTokenModal
        isOpen={!!updateTokenModal}
        accountId={updateTokenModal?.accountId || ""}
        accountName={updateTokenModal?.accountName || ""}
        onClose={() => setUpdateTokenModal(null)}
        onUpdate={handleUpdateToken}
      />
    </div>
  );
}

export default App;

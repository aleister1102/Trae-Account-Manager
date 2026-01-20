import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as api from "../api";
import type { Account } from "../types";

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (token: string, cookies?: string) => Promise<void>;
  onToast?: (type: "success" | "error" | "warning" | "info", message: string) => void;
  onAccountAdded?: () => void;
}

export function AddAccountModal({ isOpen, onClose, onAdd, onToast, onAccountAdded }: AddAccountModalProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"trae_ide" | "manual">("trae_ide");
  const [tokenInput, setTokenInput] = useState("");
  const [cookiesInput, setCookiesInput] = useState("");
  const [error, setError] = useState("");

  // New states for Trae IDE mode
  const [isReading, setIsReading] = useState(false);
  const [traeAccount, setTraeAccount] = useState<Account | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // For both modes

  if (!isOpen) return null;

  // Effect to read Trae IDE account when modal opens in trae_ide mode
  useEffect(() => {
    if (isOpen && mode === "trae_ide") {
      readTraeAccountData();
    }
  }, [isOpen, mode]);

  // 从输入中提取 Token
  const extractToken = (input: string): string | null => {
    const trimmed = input.trim();

    // 情况1: 直接是 JWT Token (以 eyJ 开头)
    if (trimmed.startsWith("eyJ")) {
      return trimmed;
    }

    // 情况2: 是 JSON 响应，尝试解析
    try {
      const json = JSON.parse(trimmed);

      // GetUserToken 接口的响应格式
      if (json.Result?.Token) {
        return json.Result.Token;
      }

      // 可能是其他格式
      if (json.token) {
        return json.token;
      }
      if (json.Token) {
        return json.Token;
      }
    } catch {
      // 不是有效的 JSON，继续尝试其他方式
    }

    // 情况3: 尝试用正则提取 Token
    const tokenMatch = trimmed.match(/"Token"\s*:\s*"(eyJ[^"]+)"/);
    if (tokenMatch) {
      return tokenMatch[1];
    }

    // 情况4: 尝试提取任何 eyJ 开头的字符串
    const jwtMatch = trimmed.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
    if (jwtMatch) {
      return jwtMatch[0];
    }

    return null;
  };

  // Function to read Trae IDE account data
  const readTraeAccountData = async () => {
    setIsReading(true);
    setError("");
    setTraeAccount(null);
    try {
      const account = await api.readTraeAccount();
      if (account) {
        setTraeAccount(account);
      } else {
        setError(t("accounts.trae_ide_not_found"));
      }
    } catch (err: any) {
      setError(err.message || t("accounts.trae_ide_read_failed"));
    } finally {
      setIsReading(false);
    }
  };

  // Handle Trae IDE import
  const handleTraeIDEImport = async () => {
    if (!traeAccount) return;

    setIsSubmitting(true);
    setError("");
    try {
      await onAdd(traeAccount.jwt_token || "", traeAccount.cookies);
      onToast?.("success", t("accounts.trae_ide_add_success", { email: traeAccount.email }));
      onAccountAdded?.();
      handleClose();
    } catch (err: any) {
      setError(err.message || t("accounts.add_account_failed"));
      onToast?.("error", err.message || t("accounts.add_account_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 手动添加账号
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setError(t("accounts.token_required"));
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const token = extractToken(tokenInput);

      if (!token) {
        setError(t("accounts.token_unrecognized"));
        setIsSubmitting(false);
        return;
      }

      // 清理 Cookies（如果有）
      const cookies = cookiesInput.trim() || undefined;

      await onAdd(token, cookies);
      setTokenInput("");
      setCookiesInput("");
      onToast?.("success", t("accounts.manual_add_success"));
      onAccountAdded?.();
      onClose();
    } catch (err: any) {
      setError(err.message || t("accounts.add_account_failed"));
      onToast?.("error", err.message || t("accounts.add_account_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError("");
    setTokenInput("");
    setCookiesInput("");
    setMode("trae_ide"); // Reset to trae_ide mode
    setTraeAccount(null); // Clear trae account data
    setIsReading(false);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t("accounts.add_account_title")}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${mode === "trae_ide" ? "active" : ""}`}
            onClick={() => setMode("trae_ide")}
            disabled={isSubmitting || isReading}
          >
            {t("accounts.mode_trae_ide")}
          </button>
          <button
            className={`tab-btn ${mode === "manual" ? "active" : ""}`}
            onClick={() => setMode("manual")}
            disabled={isSubmitting || isReading}
          >
            {t("accounts.mode_manual")}
          </button>
        </div>

        <div className="modal-body">
          {mode === "trae_ide" ? (
            <div className="trae-ide-import">
              <div className="trae-ide-desc">
                <div className="desc-icon">💻</div>
                <div className="desc-text">
                  <h3>{t("accounts.trae_ide_desc_title")}</h3>
                  <p>
                    {t("accounts.trae_ide_desc_p")}
                  </p>
                </div>
              </div>

              <div className="read-result">
                {isReading && (
                  <div className="reading-status">
                    <div className="spinner-small"></div>
                    <span>{t("accounts.reading")}</span>
                  </div>
                )}
                {traeAccount && !isReading && (
                  <div className="account-preview-mini">
                    <div className="preview-avatar">
                      {traeAccount.avatar_url ? (
                        <img src={traeAccount.avatar_url} alt="" />
                      ) : (
                        <div className="avatar-placeholder">
                          {traeAccount.name?.[0].toUpperCase() || "T"}
                        </div>
                      )}
                    </div>
                    <div className="preview-info">
                      <div className="preview-email">{traeAccount.email || traeAccount.name}</div>
                      <div className="preview-plan">
                        {traeAccount.plan_type}
                      </div>
                    </div>
                  </div>
                )}
                {!traeAccount && !isReading && error && (
                  <div className="read-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                  </div>
                )}
              </div>

              <button
                className="action-btn-large"
                onClick={handleTraeIDEImport}
                disabled={isSubmitting || isReading || !traeAccount}
              >
                {isSubmitting ? t("accounts.adding") : t("accounts.one_click_import")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="manual-form">
              <div className="form-group">
                <label>
                  {t("accounts.token_label")} <span>*</span>
                </label>
                <div className="input-desc">
                  {t("accounts.token_desc")}
                </div>
                <textarea
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder={t("accounts.placeholder_token")}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label>{t("accounts.cookies_label")}</label>
                <div className="input-desc">
                  {t("accounts.cookies_desc")}
                </div>
                <textarea
                  value={cookiesInput}
                  onChange={(e) => setCookiesInput(e.target.value)}
                  placeholder={t("accounts.placeholder_cookies")}
                  disabled={isSubmitting}
                />
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="form-actions">
                <button
                  type="button"
                  className="modal-btn-secondary"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="modal-btn-primary"
                  disabled={isSubmitting || !tokenInput.trim()}
                >
                  {isSubmitting ? t("accounts.adding") : t("accounts.add_account")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

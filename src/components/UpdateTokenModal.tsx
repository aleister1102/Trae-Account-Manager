import { useState } from "react";
import { useTranslation } from "react-i18next";

interface UpdateTokenModalProps {
  isOpen: boolean;
  accountId: string;
  accountName: string;
  onClose: () => void;
  onUpdate: (accountId: string, token: string) => Promise<void>;
}
export function UpdateTokenModal({
  isOpen,
  accountId,
  accountName,
  onClose,
  onUpdate,
}: UpdateTokenModalProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      setError(t("accounts.token_required") || "Please enter a token");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = extractToken(inputValue);

      if (!token) {
        setError(t("accounts.token_unrecognized") || "Unrecognized token");
        setLoading(false);
        return;
      }

      await onUpdate(accountId, token);
      setInputValue("");
      onClose();
    } catch (err: any) {
      setError(err.message || t("accounts.update_token_failed") || "Failed to update token");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setInputValue("");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{t("accounts.update_token")}</h2>

        <p className="modal-desc">
          {t("accounts.update_token_desc", { name: accountName })}
          <br />
          <small>{t("accounts.update_token_tip")}</small>
        </p>

        <div className="token-help">
          <details>
            <summary>{t("accounts.how_to_get_token") || "How to get a token?"}</summary>
            <ol>
              <li>{t("accounts.how_to_get_token_step1") || "Open trae.ai settings"}</li>
              <li>{t("accounts.how_to_get_token_step2") || "Press F12"}</li>
              <li>{t("accounts.how_to_get_token_step3") || "Network tab"}</li>
              <li>{t("accounts.how_to_get_token_step4") || "Refresh"}</li>
              <li>{t("accounts.how_to_get_token_step5") || "Find GetUserToken"}</li>
              <li>{t("accounts.how_to_get_token_step6") || "Response tab"}</li>
              <li>{t("accounts.how_to_get_token_step7") || "Copy and paste"}</li>
            </ol>
          </details>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t("accounts.placeholder_token")}
            rows={8}
            disabled={loading}
          />

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={handleClose} disabled={loading}>
              {t("common.cancel")}
            </button>
            <button type="submit" className="primary" disabled={loading}>
              {loading ? t("common.loading") : t("common.confirm")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

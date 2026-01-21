import { useState, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { useTranslation } from "react-i18next";
import * as api from "../api";

interface SettingsProps {
  onToast?: (type: "success" | "error" | "warning" | "info", message: string) => void;
}

export function Settings({ onToast }: SettingsProps) {
  const { t, i18n } = useTranslation();
  const [traeMachineId, setTraeMachineId] = useState<string>("");
  const [traeRefreshing, setTraeRefreshing] = useState(false);
  const [clearingTrae, setClearingTrae] = useState(false);
  const [traePath, setTraePath] = useState<string>("");
  const [traePathLoading, setTraePathLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  // 加载 Trae IDE 机器码
  const loadTraeMachineId = async () => {
    setTraeRefreshing(true);
    try {
      const id = await api.getTraeMachineId();
      setTraeMachineId(id);
    } catch (err: any) {
      console.error("获取 Trae IDE 机器码失败:", err);
      setTraeMachineId(t("common.error"));
    } finally {
      setTraeRefreshing(false);
    }
  };

  // 加载 Trae IDE 路径
  const loadTraePath = async () => {
    setTraePathLoading(true);
    try {
      const path = await api.getTraePath();
      setTraePath(path);
    } catch (err: any) {
      console.error("获取 Trae IDE 路径失败:", err);
      setTraePath("");
    } finally {
      setTraePathLoading(false);
    }
  };

  useEffect(() => {
    loadTraeMachineId();
    loadTraePath();
  }, []);

  // 复制 Trae IDE 机器码
  const handleCopyTraeMachineId = async () => {
    try {
      await navigator.clipboard.writeText(traeMachineId);
      onToast?.("success", t("settings.machine_id_copied"));
    } catch {
      onToast?.("error", t("common.error"));
    }
  };

  // 清除 Trae IDE 登录状态
  const handleClearTraeLoginState = async () => {
    if (!confirm(t("settings.clear_login_confirm"))) {
      return;
    }

    setClearingTrae(true);
    try {
      await api.clearTraeLoginState();
      await loadTraeMachineId(); // 重新加载新的机器码
      onToast?.("success", t("settings.clear_login_success"));
    } catch (err: any) {
      onToast?.("error", err.message || t("common.error"));
    } finally {
      setClearingTrae(false);
    }
  };

  // 自动扫描 Trae IDE 路径
  const handleScanTraePath = async () => {
    setScanning(true);
    try {
      const path = await api.scanTraePath();
      setTraePath(path);
      onToast?.("success", t("settings.trae_found", { path }));
    } catch (err: any) {
      onToast?.("error", err.message || t("settings.trae_not_found"));
    } finally {
      setScanning(false);
    }
  };

  // 手动设置 Trae IDE 路径
  const handleManualSetTraePath = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: "Trae IDE",
          extensions: ["exe", "app"]
        }],
        title: t("settings.select_trae_title")
      });

      if (selected) {
        const path = typeof selected === 'string' ? selected : selected[0];
        await api.setTraePath(path);
        setTraePath(path);
        onToast?.("success", t("settings.path_saved"));
      }
    } catch (err: any) {
      onToast?.("error", err.message || t("common.error"));
    }
  };

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="settings-page">
      <h2 className="page-title">{t("settings.title")}</h2>

      <div className="settings-section">
        <h3>{t("settings.language")}</h3>
        <div className="machine-id-card trae-card">
          <div className="machine-id-header">
            <div className="machine-id-icon trae-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 8l6 6" />
                <path d="M4 14l6-6 2-3" />
                <path d="M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" />
              </svg>
            </div>
            <div className="machine-id-title">
              <span>{t("settings.language")}</span>
              <span className="machine-id-subtitle">{t("settings.language_desc")}</span>
            </div>
          </div>
          <div className="machine-id-actions">
            <button
              className={`machine-id-btn ${i18n.language === "zh" ? "active" : ""}`}
              onClick={() => handleLanguageChange("zh")}
            >
              简体中文
            </button>
            <button
              className={`machine-id-btn ${i18n.language === "en" ? "active" : ""}`}
              onClick={() => handleLanguageChange("en")}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Trae IDE 机器码 */}
      <div className="settings-section">
        <h3>{t("settings.machine_id_title")}</h3>
        <div className="machine-id-card trae-card">
          <div className="machine-id-header">
            <div className="machine-id-icon trae-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="machine-id-title">
              <span>Trae IDE MachineId</span>
              <span className="machine-id-subtitle">{t("settings.machine_id_subtitle")}</span>
            </div>
          </div>
          <div className="machine-id-value">
            <code>{traeRefreshing ? t("common.loading") : traeMachineId}</code>
          </div>
          <div className="machine-id-actions">
            <button
              className="machine-id-btn"
              onClick={loadTraeMachineId}
              disabled={traeRefreshing}
              title={t("common.refresh")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              {t("common.refresh")}
            </button>
            <button
              className="machine-id-btn"
              onClick={handleCopyTraeMachineId}
              disabled={!traeMachineId || traeRefreshing || traeMachineId === t("common.error")}
              title={t("common.copy")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {t("common.copy")}
            </button>
            <button
              className="machine-id-btn danger"
              onClick={handleClearTraeLoginState}
              disabled={clearingTrae || traeRefreshing}
              title={t("settings.clear_login")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
              {clearingTrae ? t("common.loading") : t("settings.clear_login")}
            </button>
          </div>
          <div className="machine-id-tip warning">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>{t("settings.clear_login_tip")}</span>
          </div>
        </div>
      </div>

      {/* Trae IDE 路径设置 */}
      <div className="settings-section">
        <h3>{t("settings.path_title")}</h3>
        <div className="machine-id-card trae-card">
          <div className="machine-id-header">
            <div className="machine-id-icon trae-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="machine-id-title">
              <span>{t("settings.path_label")}</span>
              <span className="machine-id-subtitle">{t("settings.path_subtitle")}</span>
            </div>
          </div>
          <div className="machine-id-value">
            <code>{traePathLoading ? t("common.loading") : (traePath || t("settings.path_not_set"))}</code>
          </div>
          <div className="machine-id-actions">
            <button
              className="machine-id-btn"
              onClick={handleScanTraePath}
              disabled={scanning}
              title={t("settings.auto_scan")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              {scanning ? t("common.loading") : t("settings.auto_scan")}
            </button>
            <button
              className="machine-id-btn"
              onClick={handleManualSetTraePath}
              title={t("settings.manual_set")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {t("settings.manual_set")}
            </button>
          </div>
          <div className="machine-id-tip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <span>{t("settings.path_tip")}</span>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>{t("settings.general_title")}</h3>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t("settings.auto_refresh")}</div>
            <div className="setting-desc">{t("settings.auto_refresh_desc")}</div>
          </div>
          <label className="toggle">
            <input type="checkbox" />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t("settings.refresh_interval")}</div>
            <div className="setting-desc">{t("settings.refresh_interval_desc")}</div>
          </div>
          <select className="setting-select">
            <option value="5">5 {t("settings.minutes")}</option>
            <option value="10">10 {t("settings.minutes")}</option>
            <option value="30">30 {t("settings.minutes")}</option>
            <option value="60">60 {t("settings.minutes")}</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h3>{t("settings.data_management")}</h3>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t("common.export")}</div>
            <div className="setting-desc">{t("settings.export_desc")}</div>
          </div>
          <button className="setting-btn">{t("common.export")}</button>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">{t("common.import")}</div>
            <div className="setting-desc">{t("settings.import_desc")}</div>
          </div>
          <button className="setting-btn">{t("common.import")}</button>
        </div>

        <div className="setting-item danger">
          <div className="setting-info">
            <div className="setting-label">{t("settings.clear_data")}</div>
            <div className="setting-desc">{t("settings.clear_data_desc")}</div>
          </div>
          <button className="setting-btn danger">{t("common.delete")}</button>
        </div>
      </div>
    </div>
  );
}

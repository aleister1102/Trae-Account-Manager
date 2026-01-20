import { useEffect, useRef } from "react";

import { useTranslation } from "react-i18next";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onViewDetail: () => void;
  onRefresh: () => void;
  onUpdateToken: () => void;
  onCopyToken: () => void;
  onSwitch: () => void;
  onClaimGift: () => void;
  onDelete: () => void;
  isCurrent?: boolean;
}

export function ContextMenu({
  x,
  y,
  isCurrent,
  onClose,
  onViewDetail,
  onRefresh,
  onUpdateToken,
  onCopyToken,
  onDelete,
  onSwitch,
  onClaimGift,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    // 调整菜单位置，防止超出屏幕
    if (menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();

      if (rect.right > window.innerWidth) {
        menu.style.left = `${x - rect.width}px`;
      }
      if (rect.bottom > window.innerHeight) {
        menu.style.top = `${y - rect.height}px`;
      }
    }
  }, [x, y]);

  return (
    <>
      <div className="context-menu-overlay" onClick={onClose} />
      <div
        ref={menuRef}
        className="context-menu"
        style={{ left: x, top: y }}
      >
        <div className="context-menu-item" onClick={() => onViewDetail()}>
          <span className="item-icon">👁️</span>
          {t("accounts.view_detail")}
        </div>
        <div className="context-menu-item" onClick={() => onRefresh()}>
          <span className="item-icon">🔄</span>
          {t("accounts.refresh_data")}
        </div>
        <div className="context-menu-divider"></div>
        <div className="context-menu-item" onClick={() => onUpdateToken()}>
          <span className="item-icon">🔑</span>
          {t("accounts.update_token")}
        </div>
        <div className="context-menu-item" onClick={() => onCopyToken()}>
          <span className="item-icon">📋</span>
          {t("accounts.copy_token")}
        </div>
        <div className="context-menu-divider"></div>
        <div
          className={`context-menu-item ${isCurrent ? "disabled" : ""}`}
          onClick={() => !isCurrent && onSwitch()}
          title={isCurrent ? t("accounts.this_is_current") : ""}
        >
          <span className="item-icon">⚡</span>
          {isCurrent ? t("accounts.currently_active") : t("accounts.switch_account")}
        </div>
        <div className="context-menu-item" onClick={() => onClaimGift()}>
          <span className="item-icon">🎁</span>
          {t("accounts.claim_gift")}
        </div>
        <div className="context-menu-divider"></div>
        <div className="context-menu-item danger" onClick={() => onDelete()}>
          <span className="item-icon">🗑️</span>
          {t("accounts.delete_account")}
        </div>
      </div>
    </>
  );
}

import type { ReactNode } from "react";
import { Badge } from "../Badge/Badge";
import styles from "./SideNav.module.css";

export interface SideNavItem {
  id: string;
  label: string;
  /** 아이콘 슬롯. 없으면 라벨 첫 글자 글리프를 표시한다. */
  icon?: ReactNode;
  badge?: number;
  href?: string;
}

export interface SideNavProps {
  items: SideNavItem[];
  activeId: string;
  onSelect?: (id: string) => void;
  /** 접힘 상태 (제어형). */
  collapsed: boolean;
  onToggleCollapse: () => void;
  header?: ReactNode;
  footer?: ReactNode;
}

/**
 * 접기 가능한 좌측 주 내비게이션. collapsed는 제어형이며 onToggleCollapse로 갱신한다.
 */
export function SideNav({
  items,
  activeId,
  onSelect,
  collapsed,
  onToggleCollapse,
  header,
  footer,
}: SideNavProps) {
  return (
    <nav
      className={[styles.sidenav, collapsed ? styles.collapsed : null].filter(Boolean).join(" ")}
      aria-label="주 내비게이션"
    >
      {header ? <div className={styles.header}>{header}</div> : null}
      <ul className={styles.list}>
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                className={[styles.item, active ? styles.active : null].filter(Boolean).join(" ")}
                href={item.href ?? "#"}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                onClick={(e) => {
                  if (!item.href) e.preventDefault();
                  onSelect?.(item.id);
                }}
              >
                <span className={styles.icon} aria-hidden="true">
                  {item.icon ?? item.label.charAt(0)}
                </span>
                <span className={styles.label}>{item.label}</span>
                {item.badge != null ? (
                  <Badge className={styles.badge}>{item.badge}</Badge>
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
      <button
        type="button"
        className={styles.collapse}
        onClick={onToggleCollapse}
        aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
        aria-expanded={!collapsed}
      >
        <span
          className={[styles.chevron, collapsed ? styles.chevronRight : null]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        />
      </button>
    </nav>
  );
}

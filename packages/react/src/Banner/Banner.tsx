import type { ComponentPropsWithRef, ReactNode } from "react";
import styles from "./Banner.module.css";

export type BannerVariant = "info" | "warning" | "danger";

export interface BannerAction {
  label: string;
  onClick: () => void;
}

export interface BannerProps extends ComponentPropsWithRef<"div"> {
  /**
   * 시각적 의미. danger는 role="alert", 그 외는 role="status"로 렌더된다.
   * @default 'info'
   */
  variant?: BannerVariant;
  children: ReactNode;
  /** 우측 텍스트 액션. */
  action?: BannerAction;
  /** 지정하면 닫기 버튼이 표시되고 클릭 시 호출된다. */
  onDismiss?: () => void;
}

/**
 * 페이지 상단 등에 표시되는 상태 안내 배너. variant에 따라 색과 role이 결정된다.
 */
export function Banner({
  variant = "info",
  children,
  action,
  onDismiss,
  className,
  ...rest
}: BannerProps) {
  const cls = [styles.banner, styles[variant], className].filter(Boolean).join(" ");
  return (
    <div className={cls} role={variant === "danger" ? "alert" : "status"} {...rest}>
      <span className={styles.icon} aria-hidden="true" />
      <div className={styles.content}>{children}</div>
      {action ? (
        <button type="button" className={styles.action} onClick={action.onClick}>
          {action.label}
        </button>
      ) : null}
      {onDismiss ? (
        <button type="button" className={styles.close} aria-label="배너 닫기" onClick={onDismiss}>
          ×
        </button>
      ) : null}
    </div>
  );
}

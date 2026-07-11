import type { ComponentPropsWithRef, ReactNode } from "react";
import styles from "./Button.module.css";

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  /**
   * 시각적 위계. primary는 화면의 핵심 액션 하나에만 사용한다.
   * secondary는 흰 배경+보더, subtle은 회색 배경, ghost는 투명 배경.
   * @default 'primary'
   */
  variant?: "primary" | "secondary" | "subtle" | "danger" | "ghost";
  /**
   * 크기. 밀도 높은 UI(테이블 행 등)에는 small을 사용한다.
   * @default 'medium'
   */
  size?: "small" | "medium" | "large";
  /**
   * true면 스피너를 표시하고 클릭을 차단한다. disabled와 별개로 variant 색을 유지한다.
   * @default false
   */
  loading?: boolean;
  /** 텍스트 앞에 놓이는 아이콘. loading 중에는 스피너로 대체된다. */
  iconBefore?: ReactNode;
  /** true면 가로 폭을 100%로 채운다. */
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "medium",
  type = "button",
  loading = false,
  disabled = false,
  fullWidth = false,
  iconBefore,
  className,
  children,
  ...rest
}: ButtonProps) {
  const cls = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {!loading && iconBefore && (
        <span className={styles.icon} aria-hidden="true">
          {iconBefore}
        </span>
      )}
      <span className={styles.label}>{children}</span>
    </button>
  );
}

import styles from "./ProgressBar.module.css";

export type ProgressBarVariant = "default" | "success" | "danger";

export interface ProgressBarProps {
  /** 0~100의 진행률. indeterminate와 함께 쓰면 무시된다. @default 0 */
  value?: number;
  /** true면 값 대신 무한 진행 애니메이션을 보여준다. */
  indeterminate?: boolean;
  /** 채움 색상 의미. @default 'default' */
  variant?: ProgressBarVariant;
  /** 접근 가능 라벨(필수). */
  label: string;
  /** 루트 요소에 병합되는 클래스. */
  className?: string;
}

/**
 * 진행률 표시 막대. value(0~100) 또는 indeterminate로 상태를 나타낸다.
 */
export function ProgressBar({
  value = 0,
  indeterminate = false,
  variant = "default",
  label,
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={[
        styles.progress,
        variant !== "default" ? styles[variant] : null,
        indeterminate ? styles.indeterminate : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="progressbar"
      aria-label={label}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : clamped}
    >
      <div className={styles.fill} style={indeterminate ? undefined : { width: `${clamped}%` }} />
    </div>
  );
}

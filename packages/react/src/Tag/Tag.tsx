import styles from "./Tag.module.css";

export interface TagProps {
  /** 태그에 표시되는 텍스트. */
  label: string;
  /** 지정하면 링크 태그가 된다. */
  href?: string;
  /** 지정하면 제거(×) 버튼을 표시하고 클릭 시 호출된다. */
  onRemove?: () => void;
  /** 루트 요소에 병합되는 클래스. */
  className?: string;
}

/**
 * 짧은 라벨을 표시하는 태그. href를 주면 링크로, onRemove를 주면 제거 버튼을 갖는다.
 */
export function Tag({ label, href, onRemove, className }: TagProps) {
  const body = href ? (
    <a className={[styles.label, styles.labelLink].filter(Boolean).join(" ")} href={href}>
      {label}
    </a>
  ) : (
    <span className={styles.label}>{label}</span>
  );

  return (
    <span className={[styles.tag, className].filter(Boolean).join(" ")}>
      {body}
      {onRemove ? (
        <button
          type="button"
          className={styles.remove}
          aria-label={`${label} 태그 제거`}
          onClick={onRemove}
        >
          ×
        </button>
      ) : null}
    </span>
  );
}

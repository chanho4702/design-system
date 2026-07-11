import type { ComponentPropsWithRef, ReactNode } from "react";
import styles from "./Card.module.css";

const paddingClass = {
  none: styles.padNone,
  sm: styles.padSm,
  md: styles.padMd,
  lg: styles.padLg,
} as const;

export interface CardProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
  /** 클릭 가능한 카드. hover 시 그림자가 떠오르고 button 요소로 렌더된다. */
  interactive?: boolean;
  /**
   * 내부 여백 크기.
   * @default 'md'
   */
  padding?: "none" | "sm" | "md" | "lg";
  /** 헤더 영역의 제목. 지정하면 h3로 렌더된다. */
  title?: string;
  /** 헤더 우측 액션 슬롯. */
  headerActions?: ReactNode;
}

/**
 * 콘텐츠를 감싸는 표면 컨테이너. interactive면 button, 아니면 div로 렌더된다.
 * ref와 나머지 속성은 루트 요소로 전달된다.
 */
export function Card({
  children,
  interactive = false,
  padding = "md",
  title,
  headerActions,
  className,
  ...rest
}: CardProps) {
  const cls = [styles.card, paddingClass[padding], interactive ? styles.interactive : null, className]
    .filter(Boolean)
    .join(" ");

  const body = (
    <>
      {title || headerActions ? (
        <div className={styles.header}>
          {title ? <h3 className={styles.title}>{title}</h3> : null}
          {headerActions ? <div className={styles.actions}>{headerActions}</div> : null}
        </div>
      ) : null}
      {children}
    </>
  );

  if (interactive) {
    return (
      <button type="button" className={cls} {...(rest as ComponentPropsWithRef<"button">)}>
        {body}
      </button>
    );
  }
  return (
    <div className={cls} {...rest}>
      {body}
    </div>
  );
}

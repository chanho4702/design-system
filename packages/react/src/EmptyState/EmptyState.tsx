import type { ComponentPropsWithRef, ReactNode } from "react";
import { Button } from "../Button/Button";
import styles from "./EmptyState.module.css";

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

export interface EmptyStateProps extends Omit<ComponentPropsWithRef<"div">, "title"> {
  /** 빈 상태의 제목. */
  title: string;
  /** 제목 아래 보조 설명. */
  description?: string;
  /** 일러스트/아이콘 슬롯. 생략하면 기본 플레이스홀더가 표시된다. */
  media?: ReactNode;
  /** 주요 액션. primary 버튼으로 렌더된다. */
  primaryAction?: EmptyStateAction;
  /** 보조 액션. subtle 버튼으로 렌더된다. */
  secondaryAction?: EmptyStateAction;
}

/**
 * 데이터가 없을 때 보여주는 안내 영역. media 슬롯과 최대 2개의 액션을 지원한다.
 */
export function EmptyState({
  title,
  description,
  media,
  primaryAction,
  secondaryAction,
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div className={[styles.empty, className].filter(Boolean).join(" ")} {...rest}>
      <div className={styles.media} aria-hidden="true">
        {media ?? <span className={styles.placeholder} />}
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description ? <p className={styles.desc}>{description}</p> : null}
      {primaryAction || secondaryAction ? (
        <div className={styles.actions}>
          {primaryAction ? (
            <Button variant="primary" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          ) : null}
          {secondaryAction ? (
            <Button variant="subtle" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

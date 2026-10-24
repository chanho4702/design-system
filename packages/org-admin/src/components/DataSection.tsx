import { Button, EmptyState, Skeleton } from "@chanho/react";
import type { ReactNode } from "react";
import styles from "./DataSection.module.css";

export interface DataSectionProps {
  loading: boolean;
  /** 서버 문구 그대로. */
  error: string | null;
  /** true면 빈 상태를 그린다. */
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  children: ReactNode;
}

/** 스켈레톤 행(열 3개)의 막대 너비 — 행마다 달라 실제 목록처럼 보인다. */
const SKELETON_ROWS = [
  ["60%", "80%", "40%"],
  ["72%", "56%", "52%"],
  ["48%", "70%", "36%"],
  ["64%", "62%", "44%"],
  ["56%", "76%", "40%"],
];

/**
 * 목록 한 벌의 로딩·에러·빈 상태. 세 화면이 같은 문구·같은 자리를 쓰게 묶어 둔다.
 * 로딩 중에도 이전 데이터를 지우지 않는 화면은 `loading`을 넘기지 않고 직접 다룬다.
 */
export function DataSection({
  loading,
  error,
  empty = false,
  emptyTitle = "표시할 항목이 없습니다",
  emptyDescription,
  onRetry,
  children,
}: DataSectionProps) {
  if (loading) {
    // 스피너 대신 표 모양 스켈레톤 — 로딩이 끝나도 자리가 크게 바뀌지 않는다(지라 목록과 같은 방식).
    return (
      <div className={styles.skeleton} aria-busy="true">
        {SKELETON_ROWS.map((widths, r) => (
          <div key={r} className={styles.skeletonRow}>
            {widths.map((w, c) => (
              <Skeleton
                key={c}
                variant="text"
                width={w}
                label={r === 0 && c === 0 ? "불러오는 중" : undefined}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className={styles.state} role="alert">
        <p className={styles.errorText}>{error}</p>
        {onRetry ? (
          <Button variant="secondary" onClick={onRetry}>
            다시 시도
          </Button>
        ) : null}
      </div>
    );
  }
  if (empty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }
  return <>{children}</>;
}

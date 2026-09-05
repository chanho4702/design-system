import { Button, EmptyState, Spinner } from "@chanho/react";
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
    return (
      <div className={styles.state}>
        <Spinner size="large" label="불러오는 중" />
        <span>불러오는 중…</span>
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

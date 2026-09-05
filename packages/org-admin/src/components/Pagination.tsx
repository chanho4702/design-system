import { Button } from "@chanho/react";
import styles from "./Pagination.module.css";

export interface PaginationProps {
  /** 0부터 시작하는 현재 페이지. */
  page: number;
  size: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, size, total, onPageChange }: PaginationProps) {
  const pageCount = size > 0 ? Math.max(1, Math.ceil(total / size)) : 1;
  if (total === 0) return null;
  const from = page * size + 1;
  const to = Math.min(total, (page + 1) * size);
  return (
    <nav className={styles.bar} aria-label="페이지 이동">
      <span>
        {from}–{to} / 총 {total}
      </span>
      <Button
        variant="secondary"
        size="small"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 0}
      >
        이전
      </Button>
      <span aria-current="page">
        {page + 1} / {pageCount}
      </span>
      <Button
        variant="secondary"
        size="small"
        onClick={() => onPageChange(page + 1)}
        disabled={page + 1 >= pageCount}
      >
        다음
      </Button>
    </nav>
  );
}

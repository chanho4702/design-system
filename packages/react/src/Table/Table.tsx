import type { ReactNode } from "react";
import styles from "./Table.module.css";

export type SortDirection = "asc" | "desc";

export interface TableColumn<Row> {
  /** 행 데이터에서 값을 읽을 키. render가 없으면 이 키로 셀 값을 조회한다. */
  key: string;
  /** 헤더 셀에 표시되는 텍스트. */
  header: string;
  /** true면 헤더가 정렬 버튼이 된다. */
  sortable?: boolean;
  /** 열 너비(CSS 값). */
  width?: string;
  /** 셀 정렬. @default 'left' */
  align?: "left" | "right" | "center";
  /** 셀 커스텀 렌더러. 없으면 row[key]를 그대로 표시한다. */
  render?: (row: Row) => ReactNode;
}

export interface TableProps<Row extends { id: string }> {
  columns: TableColumn<Row>[];
  rows: Row[];
  /** 현재 정렬 중인 열의 key. */
  sortKey?: string;
  /** 현재 정렬 방향. */
  sortDirection?: SortDirection;
  /** 정렬 가능한 헤더 클릭 시 해당 열의 key로 호출된다. */
  onSort?: (key: string) => void;
  /** 스크롤 시 헤더 고정 — maxHeight와 함께 사용. */
  stickyHeader?: boolean;
  maxHeight?: number | string;
  /** 행 클릭 핸들러. 지정하면 행에 클릭 affordance가 생긴다. */
  onRowClick?: (row: Row) => void;
  /** 선택 강조할 행의 id. */
  selectedId?: string;
  /** 테이블의 접근 가능 이름(필수). */
  "aria-label": string;
  /** 루트 래퍼에 병합되는 클래스. */
  className?: string;
}

function alignClass(align?: "left" | "right" | "center") {
  if (align === "right") return styles.right;
  if (align === "center") return styles.center;
  return null;
}

/**
 * 정렬 affordance·고정 헤더·클릭/선택 행을 지원하는 데이터 테이블.
 * 행은 반드시 고유 id를 가져야 한다.
 */
export function Table<Row extends { id: string }>({
  columns,
  rows,
  sortKey,
  sortDirection,
  onSort,
  stickyHeader = false,
  maxHeight,
  onRowClick,
  selectedId,
  "aria-label": ariaLabel,
  className,
}: TableProps<Row>) {
  return (
    <div
      className={[styles.wrap, stickyHeader ? styles.wrapSticky : null, className]
        .filter(Boolean)
        .join(" ")}
      style={maxHeight != null ? { maxHeight } : undefined}
    >
      <table className={styles.table} aria-label={ariaLabel}>
        <thead className={styles.head}>
          <tr>
            {columns.map((col) => {
              const sorted = sortKey === col.key;
              return (
                <th
                  key={col.key}
                  className={[styles.th, alignClass(col.align)].filter(Boolean).join(" ")}
                  style={col.width ? { width: col.width } : undefined}
                  aria-sort={
                    sorted
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className={[styles.sort, sorted ? styles.sorted : null]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => onSort?.(col.key)}
                    >
                      {col.header}
                      <span
                        className={[
                          styles.arrow,
                          sorted && sortDirection === "desc" ? styles.arrowDesc : null,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-hidden="true"
                      />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={[
                styles.row,
                onRowClick ? styles.rowClickable : null,
                selectedId === row.id ? styles.rowSelected : null,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={[styles.td, alignClass(col.align)].filter(Boolean).join(" ")}
                >
                  {col.render
                    ? col.render(row)
                    : ((row as Record<string, unknown>)[col.key] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

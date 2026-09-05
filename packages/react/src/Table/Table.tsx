import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import styles from "./Table.module.css";

export type SortDirection = "asc" | "desc";

export interface TableColumn<Row> {
  /** 행 데이터에서 값을 읽을 키. render가 없으면 이 키로 셀 값을 조회한다. */
  key: string;
  /**
   * 헤더 셀에 표시되는 내용. 문자열 외에 체크박스·아이콘 같은 노드도 받는다.
   * 노드를 넣으면 정렬 버튼·너비 조절 핸들의 접근 이름을 만들 수 없으므로 `ariaLabel`을 함께 준다.
   */
  header: ReactNode;
  /** 열의 접근 가능 이름(문자열). 정렬 버튼과 너비 조절 핸들의 이름에 쓰인다. */
  ariaLabel?: string;
  /** true면 헤더가 정렬 버튼이 된다. */
  sortable?: boolean;
  /** 열 너비(CSS 값). resizable이면 초기 너비로 쓰인다. */
  width?: string;
  /** 셀 정렬. @default 'left' */
  align?: "left" | "right" | "center";
  /** 셀 커스텀 렌더러. 없으면 row[key]를 그대로 표시한다. */
  render?: (row: Row) => ReactNode;
  /** false면 이 열은 너비 조절·순서 변경에서 제외된다(선택 체크박스 열 등). @default true */
  adjustable?: boolean;
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
  /**
   * 헤더 오른쪽 가장자리를 끌어 열 너비를 바꿀 수 있다.
   * 너비는 내부 상태로 관리하며, columnWidths/onColumnWidthsChange로 제어·저장할 수 있다.
   */
  resizable?: boolean;
  /** 제어형 열 너비(px). key → px */
  columnWidths?: Record<string, number>;
  onColumnWidthsChange?: (widths: Record<string, number>) => void;
  /**
   * 헤더를 끌어 열 순서를 바꿀 수 있다(키보드: 헤더에 포커스 후 Alt+←/→).
   * 순서는 내부 상태로 관리하며, columnOrder/onColumnOrderChange로 제어·저장할 수 있다.
   */
  reorderable?: boolean;
  /** 제어형 열 순서(key 배열). 빠진 키는 뒤에 원래 순서로 붙는다 */
  columnOrder?: string[];
  onColumnOrderChange?: (keys: string[]) => void;
}

const MIN_WIDTH = 56;

/**
 * 열의 접근 이름으로 쓸 문자열 — ariaLabel이 있으면 그것, 없으면 header가 문자열일 때만.
 * 둘 다 없으면(노드 헤더 + ariaLabel 미지정) undefined를 돌려주고, 호출부가 이름을 생략한다.
 */
function columnName<Row>(col: TableColumn<Row>): string | undefined {
  if (col.ariaLabel) return col.ariaLabel;
  return typeof col.header === "string" ? col.header : undefined;
}

function alignClass(align?: "left" | "right" | "center") {
  if (align === "right") return styles.right;
  if (align === "center") return styles.center;
  return null;
}

/** 저장된 순서를 현재 열에 적용 — 없는 키는 버리고, 새 열은 뒤에 붙인다 */
function applyOrder<Row>(columns: TableColumn<Row>[], order: string[] | undefined): TableColumn<Row>[] {
  if (!order || order.length === 0) return columns;
  const byKey = new Map(columns.map((c) => [c.key, c]));
  const ordered: TableColumn<Row>[] = [];
  for (const key of order) {
    const col = byKey.get(key);
    if (col) {
      ordered.push(col);
      byKey.delete(key);
    }
  }
  return [...ordered, ...columns.filter((c) => byKey.has(c.key))];
}

/**
 * 정렬 affordance·고정 헤더·클릭/선택 행을 지원하는 데이터 테이블.
 * 행은 반드시 고유 id를 가져야 한다. resizable/reorderable로 열 너비·순서를 사용자가 바꿀 수 있다.
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
  resizable = false,
  columnWidths,
  onColumnWidthsChange,
  reorderable = false,
  columnOrder,
  onColumnOrderChange,
}: TableProps<Row>) {
  const [innerWidths, setInnerWidths] = useState<Record<string, number>>({});
  const [innerOrder, setInnerOrder] = useState<string[] | undefined>(undefined);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dropKey, setDropKey] = useState<string | null>(null);
  const widths = columnWidths ?? innerWidths;
  const order = columnOrder ?? innerOrder;
  const ordered = useMemo(() => applyOrder(columns, order), [columns, order]);
  const resizing = useRef<{ key: string; startX: number; startWidth: number } | null>(null);

  const commitWidths = useCallback(
    (next: Record<string, number>) => {
      if (!columnWidths) setInnerWidths(next);
      onColumnWidthsChange?.(next);
    },
    [columnWidths, onColumnWidthsChange],
  );

  const commitOrder = useCallback(
    (next: string[]) => {
      if (!columnOrder) setInnerOrder(next);
      onColumnOrderChange?.(next);
    },
    [columnOrder, onColumnOrderChange],
  );

  const moveColumn = useCallback(
    (key: string, delta: number) => {
      const keys = ordered.map((c) => c.key);
      const from = keys.indexOf(key);
      const to = from + delta;
      if (from === -1 || to < 0 || to >= keys.length) return;
      if (ordered[to].adjustable === false) return;
      const next = [...keys];
      next.splice(from, 1);
      next.splice(to, 0, key);
      commitOrder(next);
    },
    [ordered, commitOrder],
  );

  const placeColumn = useCallback(
    (key: string, beforeKey: string) => {
      if (key === beforeKey) return;
      const keys = ordered.map((c) => c.key).filter((k) => k !== key);
      const index = keys.indexOf(beforeKey);
      keys.splice(index === -1 ? keys.length : index, 0, key);
      commitOrder(keys);
    },
    [ordered, commitOrder],
  );

  useEffect(() => {
    if (!resizable) return;
    const onMove = (event: PointerEvent) => {
      const current = resizing.current;
      if (!current) return;
      const clientX = Number.isFinite(event.clientX) ? event.clientX : current.startX;
      const width = Math.max(MIN_WIDTH, Math.round(current.startWidth + (clientX - current.startX)));
      commitWidths({ ...widths, [current.key]: width });
    };
    const onUp = () => {
      resizing.current = null;
      document.body.classList.remove(styles.resizingBody);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [resizable, widths, commitWidths]);

  const startResize = (key: string, event: ReactPointerEvent<HTMLSpanElement>) => {
    const th = event.currentTarget.closest("th");
    const startWidth = widths[key] ?? th?.getBoundingClientRect().width ?? MIN_WIDTH;
    resizing.current = { key, startX: Number.isFinite(event.clientX) ? event.clientX : 0, startWidth: Number.isFinite(startWidth) ? startWidth : MIN_WIDTH };
    document.body.classList.add(styles.resizingBody);
    event.preventDefault();
    event.stopPropagation();
  };

  const onHeaderKeyDown = (key: string, event: KeyboardEvent<HTMLTableCellElement>) => {
    if (!reorderable || !event.altKey) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveColumn(key, -1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      moveColumn(key, 1);
    }
  };

  return (
    <div
      className={[styles.wrap, stickyHeader ? styles.wrapSticky : null, className]
        .filter(Boolean)
        .join(" ")}
      style={maxHeight != null ? { maxHeight } : undefined}
    >
      <table
        className={[styles.table, resizable ? styles.tableFixed : null].filter(Boolean).join(" ")}
        aria-label={ariaLabel}
      >
        {resizable ? (
          <colgroup>
            {ordered.map((col) => (
              <col
                key={col.key}
                style={widths[col.key] != null ? { width: `${widths[col.key]}px` } : col.width ? { width: col.width } : undefined}
              />
            ))}
          </colgroup>
        ) : null}
        <thead className={styles.head}>
          <tr>
            {ordered.map((col) => {
              const sorted = sortKey === col.key;
              const name = columnName(col);
              const adjustable = col.adjustable !== false;
              const canDrag = reorderable && adjustable;
              return (
                <th
                  key={col.key}
                  className={[
                    styles.th,
                    alignClass(col.align),
                    canDrag ? styles.thDraggable : null,
                    dropKey === col.key && dragKey && dragKey !== col.key ? styles.thDropTarget : null,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={!resizable && col.width ? { width: col.width } : undefined}
                  aria-sort={
                    sorted
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  tabIndex={canDrag ? 0 : undefined}
                  draggable={canDrag || undefined}
                  onKeyDown={canDrag ? (event) => onHeaderKeyDown(col.key, event) : undefined}
                  onDragStart={
                    canDrag
                      ? (event) => {
                          setDragKey(col.key);
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", col.key);
                        }
                      : undefined
                  }
                  onDragOver={
                    reorderable && adjustable
                      ? (event) => {
                          event.preventDefault();
                          if (dropKey !== col.key) setDropKey(col.key);
                        }
                      : undefined
                  }
                  onDragLeave={reorderable ? () => setDropKey((k) => (k === col.key ? null : k)) : undefined}
                  onDrop={
                    reorderable && adjustable
                      ? (event) => {
                          event.preventDefault();
                          const key = dragKey ?? event.dataTransfer.getData("text/plain");
                          if (key) placeColumn(key, col.key);
                          setDragKey(null);
                          setDropKey(null);
                        }
                      : undefined
                  }
                  onDragEnd={reorderable ? () => { setDragKey(null); setDropKey(null); } : undefined}
                  data-column-key={col.key}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className={[styles.sort, sorted ? styles.sorted : null]
                        .filter(Boolean)
                        .join(" ")}
                      aria-label={col.ariaLabel}
                      onClick={() => onSort?.(col.key)}
                    >
                      <span className={styles.thLabel}>{col.header}</span>
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
                    <span className={styles.thContent}>{col.header}</span>
                  )}
                  {resizable && adjustable ? (
                    <span
                      className={styles.resizer}
                      role="separator"
                      aria-orientation="vertical"
                      aria-label={name ? `${name} 열 너비 조절` : "열 너비 조절"}
                      onPointerDown={(event) => startResize(col.key, event)}
                      onDragStart={(event) => event.preventDefault()}
                    />
                  ) : null}
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
              {ordered.map((col) => (
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

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Dialog as RadixDialog } from "radix-ui";
import { SkeletonListItem } from "../Skeleton/Skeleton";
import styles from "./CommandPalette.module.css";

export interface CommandItem {
  /** 목록 안에서 고유한 식별자. */
  id: string;
  label: string;
  /** 라벨 오른쪽(좁으면 아래)에 붙는 보조 설명 — 예: 이슈 키, 스페이스 이름. */
  description?: string;
  /** 라벨 앞 아이콘(장식). */
  icon?: ReactNode;
  /** 그룹 제목. 같은 group의 항목이 그 제목 아래 모인다. */
  group?: string;
  /** 오른쪽 단축키 힌트. 배열이면 키를 따로 그린다(["G", "I"]). 표시만 하며 바인딩은 소비 앱 몫이다. */
  shortcut?: string | string[];
  /** 라벨 외에 검색에 걸릴 말(동의어·영문명 등). 기본 필터만 쓴다. */
  keywords?: string[];
  disabled?: boolean;
  /** 실행. 실행 후 팔레트는 닫힌다. `items`가 있으면 무시된다. */
  onSelect?: () => void;
  /** 하위 페이지 항목 — 지정하면 고를 때 닫지 않고 이 목록으로 들어간다("상태 변경 →"). */
  items?: CommandItem[];
  /** 하위 페이지 검색 입력 placeholder. */
  placeholder?: string;
}

export interface CommandPaletteProps {
  /** 제어형 열림 상태. ⌘K/Ctrl+K 같은 열기 단축키는 소비 앱이 바인딩한다. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandItem[];
  /** 대화상자·목록의 접근 이름. @default '명령 팔레트' */
  label?: string;
  /** 검색 입력 placeholder. @default '명령 또는 검색어 입력…' */
  placeholder?: string;
  /**
   * 항목 걸러내기. true/양수면 남기고 false/0 이하면 뺀다. 숫자를 돌려주면 큰 값이 위로 정렬된다(퍼지 점수).
   * 생략하면 라벨·keywords·description 부분일치(대소문자 무시).
   */
  filter?: (item: CommandItem, query: string) => boolean | number;
  /** 검색어 변경 알림 — 서버 검색을 붙일 때(결과는 items로 다시 넘긴다). */
  onQueryChange?: (query: string) => void;
  /** true면 목록 자리에 스켈레톤을 그린다. */
  loading?: boolean;
  /** 결과가 없을 때 문구. @default '결과가 없습니다' */
  emptyMessage?: string;
}

function defaultFilter(item: CommandItem, query: string): boolean {
  const q = query.toLocaleLowerCase();
  return [item.label, item.description ?? "", ...(item.keywords ?? [])].some((t) =>
    t.toLocaleLowerCase().includes(q),
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M6 3.5L10.5 8 6 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

interface Page {
  title: string;
  items: CommandItem[];
  placeholder?: string;
}

/**
 * 명령 팔레트(리니어 ⌘K 식). 모달 대화상자 안 검색 입력 + 그룹 목록.
 * 키보드: ↑↓ 이동(끝에서 순환), Home·End, Enter 실행/하위 페이지 진입, Esc는 하위 페이지면 한 단계 뒤로 아니면 닫기,
 * 빈 입력에서 Backspace는 한 단계 뒤로. 포커스는 입력에 머물고 강조 항목은 aria-activedescendant로 알린다.
 */
export function CommandPalette({
  open,
  onOpenChange,
  items,
  label = "명령 팔레트",
  placeholder = "명령 또는 검색어 입력…",
  filter,
  onQueryChange,
  loading = false,
  emptyMessage = "결과가 없습니다",
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [pages, setPages] = useState<Page[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const baseId = useId();
  const listId = `${baseId}-list`;
  const optionId = (id: string) => `${baseId}-opt-${encodeURIComponent(id)}`;

  // 닫히면 처음 상태로 — 다음에 열 때 지난 검색어·하위 페이지가 남지 않게
  useEffect(() => {
    if (!open) {
      setQuery("");
      setPages([]);
      setActive(null);
    }
  }, [open]);

  const page = pages[pages.length - 1];
  const depthRef = useRef(0);
  depthRef.current = pages.length;
  const source = page ? page.items : items;

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return source;
    const scored = source
      .map((item, index) => {
        const r = filter ? filter(item, q) : defaultFilter(item, q);
        const score = typeof r === "number" ? r : r ? 1 : 0;
        return { item, index, score };
      })
      .filter((x) => x.score > 0);
    scored.sort((a, b) => b.score - a.score || a.index - b.index);
    return scored.map((x) => x.item);
  }, [source, query, filter]);

  // 그룹은 결과에 처음 나온 순서대로, 항목은 그룹 안에서 결과 순서대로
  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of results) {
      const key = item.group ?? "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return [...map.entries()];
  }, [results]);
  const ordered = useMemo(() => groups.flatMap(([, list]) => list), [groups]);
  const enabled = ordered.filter((i) => !i.disabled);

  // 결과가 바뀌면 첫 활성 항목을 강조(강조 항목이 아직 남아 있으면 유지)
  useEffect(() => {
    if (active !== null && enabled.some((i) => i.id === active)) return;
    setActive(enabled[0]?.id ?? null);
    // enabled는 ordered에서 파생되므로 ordered만 지켜본다
  }, [ordered]);

  useEffect(() => {
    if (open && active !== null) {
      document.getElementById(`${baseId}-opt-${encodeURIComponent(active)}`)?.scrollIntoView({ block: "nearest" });
    }
  }, [open, active, baseId]);

  const changeQuery = (q: string) => {
    setQuery(q);
    onQueryChange?.(q);
  };

  const run = (item: CommandItem | undefined) => {
    if (!item || item.disabled) return;
    if (item.items) {
      setPages((p) => [...p, { title: item.label, items: item.items!, placeholder: item.placeholder }]);
      changeQuery("");
      setActive(null);
      inputRef.current?.focus();
      return;
    }
    item.onSelect?.();
    onOpenChange(false);
  };

  const back = () => {
    setPages((p) => p.slice(0, -1));
    changeQuery("");
    setActive(null);
  };

  const move = (to: "next" | "prev" | "first" | "last") => {
    if (enabled.length === 0) return;
    const last = enabled.length - 1;
    const idx = enabled.findIndex((i) => i.id === active);
    let next: number;
    if (to === "first") next = 0;
    else if (to === "last") next = last;
    else if (to === "next") next = idx === -1 || idx === last ? 0 : idx + 1;
    else next = idx <= 0 ? last : idx - 1;
    setActive(enabled[next].id);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return; // 한글 조합 중 Enter·화살표는 IME 몫
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        move("next");
        break;
      case "ArrowUp":
        e.preventDefault();
        move("prev");
        break;
      case "Home":
        e.preventDefault();
        move("first");
        break;
      case "End":
        e.preventDefault();
        move("last");
        break;
      case "Enter":
        e.preventDefault();
        run(enabled.find((i) => i.id === active));
        break;
      case "Backspace":
        if (query === "" && pages.length > 0) {
          e.preventDefault();
          back();
        }
        break;
      default:
        break;
    }
  };

  const activeVisible = active !== null && enabled.some((i) => i.id === active);

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={styles.overlay} />
        <RadixDialog.Content
          className={styles.content}
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
          onEscapeKeyDown={(e) => {
            // 하위 페이지에서는 닫지 않고 한 단계 뒤로
            // (Radix가 리스너를 등록한 시점의 상태를 볼 수 있어 ref로 최신 깊이를 읽는다)
            if (depthRef.current > 0) {
              e.preventDefault();
              back();
            }
          }}
        >
          <RadixDialog.Title className={styles.visuallyHidden}>{label}</RadixDialog.Title>
          <div className={styles.searchRow}>
            <span className={styles.searchIcon} aria-hidden="true">
              <SearchIcon />
            </span>
            {page ? (
              <span className={styles.crumb} title={page.title}>
                {page.title}
              </span>
            ) : null}
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              role="combobox"
              aria-label={page ? `${label} — ${page.title}` : label}
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeVisible ? optionId(active!) : undefined}
              placeholder={page?.placeholder ?? placeholder}
              value={query}
              onChange={(e) => changeQuery(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className={styles.body}>
            {loading ? (
              <div aria-busy="true">
                <SkeletonListItem media="icon" label="불러오는 중" />
                <SkeletonListItem media="icon" width="45%" />
                <SkeletonListItem media="icon" width="70%" />
                <SkeletonListItem media="icon" width="35%" />
              </div>
            ) : (
              <div id={listId} role="listbox" aria-label={label} className={styles.list}>
                {groups.map(([group, list]) => {
                  const options = list.map((item) => {
                    const isActive = item.id === active;
                    const keys = item.shortcut === undefined ? [] : Array.isArray(item.shortcut) ? item.shortcut : [item.shortcut];
                    return (
                      <div
                        key={item.id}
                        id={optionId(item.id)}
                        role="option"
                        aria-selected={isActive}
                        aria-disabled={item.disabled || undefined}
                        aria-keyshortcuts={keys.length ? keys.join(" ") : undefined}
                        data-highlighted={isActive ? "" : undefined}
                        data-disabled={item.disabled ? "" : undefined}
                        className={styles.item}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseMove={() => {
                          if (!item.disabled && active !== item.id) setActive(item.id);
                        }}
                        onClick={() => run(item)}
                      >
                        {item.icon ? (
                          <span className={styles.icon} aria-hidden="true">
                            {item.icon}
                          </span>
                        ) : null}
                        <span className={styles.label} title={item.label}>
                          {item.label}
                        </span>
                        {item.description ? <span className={styles.description}>{item.description}</span> : null}
                        {keys.length ? (
                          <span className={styles.keys} aria-hidden="true">
                            {keys.map((k, i) => (
                              <kbd key={i} className={styles.kbd}>
                                {k}
                              </kbd>
                            ))}
                          </span>
                        ) : null}
                        {item.items ? (
                          <span className={styles.chevron} aria-hidden="true">
                            <ChevronRightIcon />
                          </span>
                        ) : null}
                      </div>
                    );
                  });
                  return group ? (
                    <div key={group} role="group" aria-label={group} className={styles.group}>
                      <div className={styles.groupLabel} aria-hidden="true">
                        {group}
                      </div>
                      {options}
                    </div>
                  ) : (
                    <div key="__ungrouped" role="presentation" className={styles.group}>
                      {options}
                    </div>
                  );
                })}
              </div>
            )}
            {!loading && results.length === 0 ? (
              <p className={styles.empty} role="status">
                {emptyMessage}
              </p>
            ) : null}
          </div>
          <div className={styles.footer} aria-hidden="true">
            <span>
              <kbd className={styles.kbd}>↑</kbd>
              <kbd className={styles.kbd}>↓</kbd> 이동
            </span>
            <span>
              <kbd className={styles.kbd}>Enter</kbd> 실행
            </span>
            <span>
              <kbd className={styles.kbd}>Esc</kbd> {pages.length > 0 ? "뒤로" : "닫기"}
            </span>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

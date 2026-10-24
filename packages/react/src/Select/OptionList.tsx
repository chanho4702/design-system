import { useEffect, useId, useMemo, useState } from "react";
import type { KeyboardEvent, ReactNode, RefObject } from "react";
import type { SelectOption } from "./Select";
import styles from "./Select.module.css";

/**
 * 검색형 Select·MultiSelect가 함께 쓰는 팝오버 안 옵션 목록(내부 전용).
 * WAI-ARIA combobox/listbox 패턴 — 포커스는 검색 입력(없으면 목록)에 머물고, 강조 항목은 aria-activedescendant로 알린다.
 * 키보드: ↑↓ 이동(비활성 건너뜀), Home·End, Enter 선택(한글 조합 중 Enter는 무시). Esc는 팝오버가 닫는다.
 */

export function ChevronIcon() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true">
      <path
        d="M2.5 4.5L6 8l3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 연달아 같은 group을 가진 옵션을 한 묶음으로. group이 없는 옵션은 제목 없는 묶음이 된다. */
export function groupOptions(options: SelectOption[]): { group?: string; items: SelectOption[] }[] {
  const out: { group?: string; items: SelectOption[] }[] = [];
  for (const option of options) {
    const last = out[out.length - 1];
    if (last && last.group === option.group) last.items.push(option);
    else out.push({ group: option.group, items: [option] });
  }
  return out;
}

export function OptionIcon({ option }: { option: SelectOption }) {
  return option.icon ? (
    <span className={styles.itemIcon} aria-hidden="true">
      {option.icon}
    </span>
  ) : null;
}

export interface OptionListProps {
  label: string;
  options: SelectOption[];
  /** 현재 선택된 값들(단일 선택이면 0~1개). */
  selected: string[];
  /** true면 여러 개 고르는 목록 — 항목 앞 체크 상자, aria-multiselectable. */
  multiple?: boolean;
  /** true면 목록 위에 검색 입력. */
  searchable: boolean;
  searchPlaceholder: string;
  noOptionsMessage: string;
  /** 항목을 골랐을 때(비활성 항목은 부르지 않는다). */
  onPick: (option: SelectOption) => void;
  /** 단일 선택에서 Tab — 닫고 트리거로 돌아가게 한다. 없으면 Tab은 기본 동작. */
  onTab?: () => void;
  /** 포커스를 받을 요소(검색 입력 또는 목록)를 돌려준다 — 팝오버가 열릴 때 여기에 포커스한다. */
  focusRef: RefObject<HTMLElement | null>;
  /** 목록 아래에 붙는 요소(전체 해제 등). */
  footer?: ReactNode;
}

export function OptionList({
  label,
  options,
  selected,
  multiple = false,
  searchable,
  searchPlaceholder,
  noOptionsMessage,
  onPick,
  onTab,
  focusRef,
  footer,
}: OptionListProps) {
  const baseId = useId();
  const listId = `${baseId}-list`;
  const optionId = (v: string) => `${baseId}-opt-${encodeURIComponent(v)}`;
  const [query, setQuery] = useState("");
  // 열릴 때(마운트) 첫 선택 항목, 없으면 첫 활성 항목을 강조한다
  const [active, setActive] = useState<string | null>(
    () =>
      options.find((o) => !o.disabled && selected.includes(o.value))?.value ??
      options.find((o) => !o.disabled)?.value ??
      null,
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return q ? options.filter((o) => o.label.toLocaleLowerCase().includes(q)) : options;
  }, [options, query]);
  const enabled = filtered.filter((o) => !o.disabled);
  const activeVisible = active !== null && enabled.some((o) => o.value === active);

  useEffect(() => {
    if (active === null) return;
    // 목록은 포털로 body에 붙는다 — id로 찾아 강조 항목이 보이게 굴린다.
    document.getElementById(`${baseId}-opt-${encodeURIComponent(active)}`)?.scrollIntoView({ block: "nearest" });
  }, [active, baseId]);

  const move = (to: "next" | "prev" | "first" | "last") => {
    if (enabled.length === 0) return;
    const last = enabled.length - 1;
    const idx = enabled.findIndex((o) => o.value === active);
    let next: number;
    if (to === "first") next = 0;
    else if (to === "last") next = last;
    else if (idx === -1) next = to === "next" ? 0 : last;
    else next = to === "next" ? Math.min(idx + 1, last) : Math.max(idx - 1, 0);
    setActive(enabled[next].value);
  };

  const pick = (option: SelectOption | undefined) => {
    if (!option || option.disabled) return;
    onPick(option);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.nativeEvent.isComposing) return; // 한글 조합을 끝내는 Enter·화살표는 IME 몫
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
        pick(enabled.find((o) => o.value === active));
        break;
      case " ":
        // 검색 입력이 없을 때만 Space로 고른다(입력에서는 공백 글자)
        if (!searchable) {
          e.preventDefault();
          pick(enabled.find((o) => o.value === active));
        }
        break;
      case "Tab":
        if (onTab) {
          e.preventDefault();
          onTab();
        }
        break;
      default:
        break;
    }
  };

  const comboProps = {
    "aria-controls": listId,
    "aria-activedescendant": activeVisible ? optionId(active!) : undefined,
    onKeyDown,
  };

  const renderOption = (option: SelectOption) => {
    const isSelected = selected.includes(option.value);
    return (
      <div
        key={option.value}
        id={optionId(option.value)}
        role="option"
        aria-selected={isSelected}
        aria-disabled={option.disabled || undefined}
        data-disabled={option.disabled ? "" : undefined}
        data-highlighted={option.value === active ? "" : undefined}
        data-state={isSelected ? "checked" : "unchecked"}
        className={[styles.item, multiple ? styles.itemMulti : null].filter(Boolean).join(" ")}
        title={option.label}
        // 클릭해도 포커스는 검색 입력(또는 목록)에 남는다
        onMouseDown={(e) => e.preventDefault()}
        onMouseMove={() => {
          if (!option.disabled && active !== option.value) setActive(option.value);
        }}
        onClick={() => pick(option)}
      >
        {multiple ? (
          <span className={styles.box} data-state={isSelected ? "checked" : "unchecked"} aria-hidden="true">
            {isSelected ? <CheckIcon /> : null}
          </span>
        ) : null}
        <span className={styles.itemContent}>
          <OptionIcon option={option} />
          <span className={styles.itemText}>{option.label}</span>
        </span>
        {!multiple && isSelected ? (
          <span className={styles.check}>
            <CheckIcon />
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <>
      {searchable ? (
        <div className={styles.search}>
          <input
            ref={focusRef as RefObject<HTMLInputElement | null>}
            className={styles.searchInput}
            type="text"
            role="combobox"
            aria-label={`${label} 검색`}
            aria-expanded="true"
            aria-autocomplete="list"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => {
              const q = e.target.value;
              setQuery(q);
              const lower = q.trim().toLocaleLowerCase();
              const first = options.find((o) => !o.disabled && o.label.toLocaleLowerCase().includes(lower));
              setActive(first?.value ?? null);
            }}
            {...comboProps}
          />
        </div>
      ) : null}
      <div
        id={listId}
        role="listbox"
        aria-label={label}
        aria-multiselectable={multiple || undefined}
        className={styles.viewport}
        // 검색 입력이 없으면 목록이 포커스를 받아 키보드를 처리한다
        {...(searchable
          ? {}
          : { ref: focusRef as RefObject<HTMLDivElement | null>, tabIndex: 0, ...comboProps })}
      >
        {groupOptions(filtered).map((g, gi) =>
          g.group !== undefined ? (
            <div key={`g-${gi}`} role="group" aria-label={g.group} className={styles.group}>
              <div className={styles.groupLabel} aria-hidden="true">
                {g.group}
              </div>
              {g.items.map(renderOption)}
            </div>
          ) : (
            g.items.map(renderOption)
          ),
        )}
      </div>
      {filtered.length === 0 ? (
        <p className={styles.empty} role="status">
          {noOptionsMessage}
        </p>
      ) : null}
      {footer}
    </>
  );
}

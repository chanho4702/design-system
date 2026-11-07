import { useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Popover } from "../Popover/Popover";
import { ChevronIcon, OptionList } from "../Select/OptionList";
import type { SelectOption } from "../Select/Select";
import selectStyles from "../Select/Select.module.css";
import styles from "./MultiSelect.module.css";

export interface MultiSelectProps {
  /** 라벨 텍스트. 트리거의 접근 이름이 된다. */
  label: string;
  /** 선택지 — Select와 같은 모양(icon·disabled·group). */
  options: SelectOption[];
  /** 제어 값(선택된 value 배열). */
  value?: string[];
  /** 비제어 초기 값. */
  defaultValue?: string[];
  /** 선택이 바뀔 때 — 옵션 순서대로 정렬된 배열(목록 밖 값은 뒤에). 비동기 모드(onSearchChange)는 고른 순서. */
  onValueChange?: (values: string[]) => void;
  /** 아무것도 고르지 않았을 때 문구. */
  placeholder?: string;
  disabled?: boolean;
  /** 루트 래퍼에 병합되는 클래스. */
  className?: string;
  id?: string;
  /**
   * 목록 위 검색 입력.
   * @default true
   */
  searchable?: boolean;
  /** @default '검색' */
  searchPlaceholder?: string;
  /** @default '일치하는 항목이 없습니다' */
  noOptionsMessage?: string;
  /** 높이 — Select와 같다. @default 'default' */
  size?: "default" | "compact";
  /**
   * 트리거에 칩으로 보여 줄 최대 개수. 넘치면 "+N"으로 줄인다.
   * @default 2
   */
  maxChips?: number;
  /** 목록 아래 "전체 해제" 버튼 문구. @default '전체 해제' */
  clearLabel?: string;
  /**
   * 검색어가 바뀔 때 — 주면 비동기 모드다. options는 서버가 거른 현재 후보로 보고 다시 거르지 않으며,
   * 후보 목록에서 사라진 선택도 칩으로 남는다(한 번 본 라벨을 기억). 값 순서는 고른 순서다.
   */
  onSearchChange?: (query: string) => void;
  /** 후보를 받는 중. */
  loading?: boolean;
  /** @default '불러오는 중…' */
  loadingMessage?: string;
  /** true면 후보에 없는 검색어를 그대로 값으로 추가할 수 있다(목록 끝 "추가" 항목). */
  creatable?: boolean;
  /** 추가 항목 문구. @default (q) => `"${q}" 추가` */
  createLabel?: (query: string) => string;
}

/**
 * 여러 개 고르는 선택(Atlassian CheckboxSelect / 지라 필터의 "상태 ▾" 체크 목록).
 * 트리거에는 고른 항목을 칩으로 요약하고, 팝오버 안에서 체크 목록·검색·전체 해제를 한다.
 * 고를 때 닫히지 않는다 — Esc·바깥 클릭으로 닫으면 트리거로 포커스가 돌아온다.
 * 키보드: 트리거 ↓/↑/Enter/Space로 열기, ↑↓·Home·End 이동, Enter(검색 없으면 Space도)로 켜고 끄기.
 */
export function MultiSelect({
  label,
  options,
  value,
  defaultValue = [],
  onValueChange,
  placeholder,
  disabled,
  className,
  id,
  searchable = true,
  searchPlaceholder = "검색",
  noOptionsMessage = "일치하는 항목이 없습니다",
  size = "default",
  maxChips = 2,
  clearLabel = "전체 해제",
  onSearchChange,
  loading,
  loadingMessage,
  creatable = false,
  createLabel = (q) => `"${q}" 추가`,
}: MultiSelectProps) {
  const autoId = useId();
  const triggerId = id ?? autoId;
  const summaryId = `${triggerId}-summary`;
  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState<string[]>(defaultValue);
  const current = value ?? uncontrolled;
  const focusRef = useRef<HTMLElement | null>(null);
  const async = onSearchChange !== undefined;
  // 비동기 후보는 검색어마다 바뀐다 — 한 번 본 옵션(라벨·아이콘)을 기억해 칩이 값 문자열로 퇴화하지 않게 한다
  const seen = useRef(new Map<string, SelectOption>());
  for (const o of options) seen.current.set(o.value, o);

  const known = (v: string) => options.some((o) => o.value === v);
  const asOption = (v: string) => seen.current.get(v) ?? { value: v, label: v };
  // 정적 목록은 옵션 순서대로(고른 순서와 무관하게 늘 같은 순서) + 목록 밖 값(직접 추가)은 뒤에 고른 순서로,
  // 비동기 목록은 후보가 검색어마다 바뀌므로 전부 고른 순서대로
  // 목록 밖 값을 남기는 건 creatable일 때만 — 일반 정적 목록은 예전처럼 options에 있는 값만 선택으로 본다
  const extras = (vs: string[]) => (creatable ? vs.filter((v) => !known(v)) : []);
  const selectedOptions = async
    ? current.map(asOption)
    : [...options.filter((o) => current.includes(o.value)), ...extras(current).map(asOption)];

  // 이미 고른 값(현재 후보에 없어도 기억한 라벨 포함)과 이름이 같으면 "추가" 대신 그 선택을 보인다 — 같은 라벨 칩 중복 방지
  const createFor = (q: string): SelectOption => {
    const lower = q.toLocaleLowerCase();
    const picked = selectedOptions.find(
      (o) => o.value.toLocaleLowerCase() === lower || o.label.toLocaleLowerCase() === lower,
    );
    return picked ?? { value: q, label: createLabel(q) };
  };

  const commit = (next: string[]) => {
    const unique = [...new Set(next)];
    const ordered = async
      ? unique
      : [...options.filter((o) => unique.includes(o.value)).map((o) => o.value), ...extras(unique)];
    if (value === undefined) setUncontrolled(ordered);
    onValueChange?.(ordered);
  };

  const toggle = (option: SelectOption) => {
    commit(current.includes(option.value) ? current.filter((v) => v !== option.value) : [...current, option.value]);
  };

  const changeOpen = (next: boolean) => {
    // 다시 열면 검색 입력은 빈칸으로 새로 뜬다 — 부모 후보도 지난 검색어로 걸러진 채 남지 않게 빈 검색을 알린다
    if (next && !open) onSearchChange?.("");
    setOpen(next);
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !open) {
      e.preventDefault();
      changeOpen(true);
    }
  };

  const shown = selectedOptions.slice(0, Math.max(0, maxChips));
  const rest = selectedOptions.length - shown.length;
  const summary = selectedOptions.map((o) => o.label).join(", ");

  return (
    <div className={[selectStyles.field, className].filter(Boolean).join(" ")}>
      <label className={selectStyles.label} htmlFor={triggerId}>
        {label}
      </label>
      <Popover
        open={open}
        onOpenChange={changeOpen}
        label={label}
        padding="none"
        className={[selectStyles.content, selectStyles.searchContent].join(" ")}
        initialFocusRef={focusRef}
        trigger={
          <button
            type="button"
            id={triggerId}
            role="combobox"
            aria-expanded={open}
            aria-describedby={selectedOptions.length ? summaryId : undefined}
            className={[selectStyles.trigger, size === "compact" ? selectStyles.compact : null].filter(Boolean).join(" ")}
            data-placeholder={selectedOptions.length ? undefined : ""}
            disabled={disabled}
            title={summary || undefined}
            onKeyDown={onTriggerKeyDown}
          >
            <span className={[selectStyles.triggerValue, styles.chips].join(" ")}>
              {selectedOptions.length === 0 ? (
                <span className={selectStyles.valueText}>{placeholder}</span>
              ) : (
                <>
                  {shown.map((o) => (
                    <span key={o.value} className={styles.chip}>
                      {o.icon ? (
                        <span className={selectStyles.itemIcon} aria-hidden="true">
                          {o.icon}
                        </span>
                      ) : null}
                      <span className={styles.chipText}>{o.label}</span>
                    </span>
                  ))}
                  {rest > 0 ? <span className={styles.more}>+{rest}</span> : null}
                </>
              )}
              {/* 칩은 잘릴 수 있다 — 스크린리더에는 선택 전체를 설명으로 준다 */}
              <span id={summaryId} className={styles.visuallyHidden}>
                {selectedOptions.length ? `${selectedOptions.length}개 선택: ${summary}` : ""}
              </span>
            </span>
            <span className={selectStyles.chevron} aria-hidden="true">
              <ChevronIcon />
            </span>
          </button>
        }
      >
        <OptionList
          label={label}
          options={options}
          selected={current}
          multiple
          searchable={searchable}
          searchPlaceholder={searchPlaceholder}
          noOptionsMessage={noOptionsMessage}
          focusRef={focusRef}
          onPick={toggle}
          onQueryChange={onSearchChange}
          filterLocally={!async}
          loading={loading}
          loadingMessage={loadingMessage}
          createOption={creatable ? createFor : undefined}
          footer={
            <div className={styles.footer}>
              <span className={styles.count} aria-live="polite">
                {selectedOptions.length}개 선택
              </span>
              <button
                type="button"
                className={styles.clear}
                disabled={selectedOptions.length === 0}
                onClick={() => {
                  commit([]);
                  focusRef.current?.focus();
                }}
              >
                {clearLabel}
              </button>
            </div>
          }
        />
      </Popover>
    </div>
  );
}

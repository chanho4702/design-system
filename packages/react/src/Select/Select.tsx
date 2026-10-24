import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Popover as RadixPopover, Select as RadixSelect } from "radix-ui";
import styles from "./Select.module.css";

export interface SelectOption {
  value: string;
  label: string;
  /**
   * 라벨 앞에 놓이는 아이콘(Dropdown의 `icon`과 같은 규칙).
   * 목록과 트리거의 선택값 양쪽에 같은 아이콘이 나온다. 크기는 소비자가 정한다.
   * 장식이므로 스크린리더에서는 감춰지고, 접근 이름은 label로 남는다.
   */
  icon?: ReactNode;
  /** 선택 불가 옵션으로 표시한다. */
  disabled?: boolean;
  /**
   * 그룹 제목. 연달아 같은 group을 가진 옵션들이 그 제목 아래 묶인다(지라 필드 선택의 "최근 / 전체" 같은 묶음).
   * 그룹 제목 자체는 선택할 수 없다.
   */
  group?: string;
}

export interface SelectProps {
  /** 라벨 텍스트. 접근성을 위해 필수이며 트리거와 자동 연결된다. */
  label: string;
  /** 선택지 목록. */
  options: SelectOption[];
  /** 제어 값. */
  value?: string;
  /** 비제어 초기 값. */
  defaultValue?: string;
  /** 값 변경 콜백. */
  onValueChange?: (value: string) => void;
  /** 미선택 시 표시 문구. */
  placeholder?: string;
  disabled?: boolean;
  /** 루트 래퍼에 병합되는 클래스. */
  className?: string;
  id?: string;
  /**
   * true면 목록 위에 검색 입력이 붙는다(Atlassian PopupSelect·지라 필터 선택처럼).
   * 입력한 글자가 라벨에 들어 있는 옵션만 남고, ↑↓·Home·End로 움직이고 Enter로 고른다.
   * 옵션이 많을 때(대략 8개 이상) 켠다.
   * @default false
   */
  searchable?: boolean;
  /** 검색 입력의 placeholder. @default '검색' */
  searchPlaceholder?: string;
  /** 검색 결과가 없을 때 문구. @default '일치하는 항목이 없습니다' */
  noOptionsMessage?: string;
}

function ChevronIcon() {
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

function CheckIcon() {
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
function groupOptions(options: SelectOption[]): { group?: string; items: SelectOption[] }[] {
  const out: { group?: string; items: SelectOption[] }[] = [];
  for (const option of options) {
    const last = out[out.length - 1];
    if (last && last.group === option.group) last.items.push(option);
    else out.push({ group: option.group, items: [option] });
  }
  return out;
}

function OptionBody({ option }: { option: SelectOption }) {
  return option.icon ? (
    <span className={styles.itemIcon} aria-hidden="true">
      {option.icon}
    </span>
  ) : null;
}

export function Select({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  disabled,
  className,
  id,
  searchable = false,
  searchPlaceholder = "검색",
  noOptionsMessage = "일치하는 항목이 없습니다",
}: SelectProps) {
  const autoId = useId();
  const triggerId = id ?? autoId;
  // Radix의 Value는 선택된 항목의 ItemText만 복제하므로 아이콘은 따라오지 않는다.
  // 트리거에도 같은 아이콘을 그리려고 현재 값을 따로 따라간다(제어 시에는 value가 곧 답).
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const currentValue = value ?? uncontrolledValue;
  const selected = options.find((option) => option.value === currentValue);

  const handleValueChange = (next: string) => {
    if (value === undefined) setUncontrolledValue(next);
    onValueChange?.(next);
  };

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <label className={styles.label} htmlFor={triggerId}>
        {label}
      </label>
      {searchable ? (
        <SearchableSelect
          label={label}
          triggerId={triggerId}
          options={options}
          selected={selected}
          onSelect={handleValueChange}
          placeholder={placeholder}
          disabled={disabled}
          searchPlaceholder={searchPlaceholder}
          noOptionsMessage={noOptionsMessage}
        />
      ) : (
        <RadixSelect.Root
          value={value}
          defaultValue={defaultValue}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <RadixSelect.Trigger id={triggerId} className={styles.trigger} title={selected?.label}>
            <span className={styles.triggerValue}>
              {selected?.icon ? (
                <span className={styles.itemIcon} aria-hidden="true">
                  {selected.icon}
                </span>
              ) : null}
              <RadixSelect.Value className={styles.valueText} placeholder={placeholder} />
            </span>
            <RadixSelect.Icon className={styles.chevron}>
              <ChevronIcon />
            </RadixSelect.Icon>
          </RadixSelect.Trigger>
          <RadixSelect.Portal>
            {/* 포털 + 충돌 회피: 모달·스크롤 컨테이너 안에서도 잘리지 않고, 아래 공간이 모자라면 위로 뒤집힌다.
                최대 높이(300px, Atlassian select 기본)는 CSS가 뷰포트 남은 높이와 함께 제한한다. */}
            <RadixSelect.Content
              className={styles.content}
              position="popper"
              sideOffset={4}
              collisionPadding={8}
            >
              <RadixSelect.Viewport className={styles.viewport}>
                {groupOptions(options).map((g, gi) =>
                  g.group !== undefined ? (
                    <RadixSelect.Group key={`g-${gi}`} className={styles.group}>
                      <RadixSelect.Label className={styles.groupLabel}>{g.group}</RadixSelect.Label>
                      {g.items.map((option) => (
                        <RadixItem key={option.value} option={option} />
                      ))}
                    </RadixSelect.Group>
                  ) : (
                    g.items.map((option) => <RadixItem key={option.value} option={option} />)
                  ),
                )}
              </RadixSelect.Viewport>
            </RadixSelect.Content>
          </RadixSelect.Portal>
        </RadixSelect.Root>
      )}
    </div>
  );
}

function RadixItem({ option }: { option: SelectOption }) {
  return (
    <RadixSelect.Item
      value={option.value}
      className={styles.item}
      disabled={option.disabled}
      // 긴 한글 옵션은 말줄임 — 전체 문구는 브라우저 툴팁으로 확인한다.
      title={option.label}
    >
      <span className={styles.itemContent}>
        <OptionBody option={option} />
        <RadixSelect.ItemText className={styles.itemText}>{option.label}</RadixSelect.ItemText>
      </span>
      <RadixSelect.ItemIndicator className={styles.check}>
        <CheckIcon />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
}

interface SearchableSelectProps {
  label: string;
  triggerId: string;
  options: SelectOption[];
  selected: SelectOption | undefined;
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchPlaceholder: string;
  noOptionsMessage: string;
}

/**
 * 검색 입력이 붙는 선택 — Radix Select는 목록 안 입력을 지원하지 않아 Popover + listbox로 만든다.
 * 키보드: 트리거 ↓/↑/Enter/Space로 열기, 입력에서 ↑↓·Home·End 이동, Enter 선택, Esc 닫기(포커스는 트리거로).
 * 포커스는 입력에 머물고 강조 항목은 aria-activedescendant로 알린다(WAI-ARIA combobox 패턴).
 */
function SearchableSelect({
  label,
  triggerId,
  options,
  selected,
  onSelect,
  placeholder,
  disabled,
  searchPlaceholder,
  noOptionsMessage,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const baseId = useId();
  const listId = `${baseId}-list`;
  const optionId = (v: string) => `${baseId}-opt-${encodeURIComponent(v)}`;

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return q ? options.filter((o) => o.label.toLocaleLowerCase().includes(q)) : options;
  }, [options, query]);
  const enabled = filtered.filter((o) => !o.disabled);

  const openList = () => {
    setQuery("");
    setActive(selected && !selected.disabled ? selected.value : (options.find((o) => !o.disabled)?.value ?? null));
    setOpen(true);
  };

  useEffect(() => {
    if (!open || active === null) return;
    // 목록은 포털로 body에 붙는다 — id로 찾아 강조 항목이 보이게 굴린다.
    document.getElementById(`${baseId}-opt-${encodeURIComponent(active)}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, baseId]);

  const choose = (option: SelectOption | undefined) => {
    if (!option || option.disabled) return;
    onSelect(option.value);
    setOpen(false);
  };

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

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
        choose(enabled.find((o) => o.value === active));
        break;
      case "Tab":
        // 목록 안에 다른 포커스 대상이 없다 — 닫고 트리거로 돌아간다.
        e.preventDefault();
        setOpen(false);
        break;
      default:
        break;
    }
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !open) {
      e.preventDefault();
      openList();
    }
  };

  const groups = groupOptions(filtered);
  const activeVisible = active !== null && enabled.some((o) => o.value === active);

  const renderOption = (option: SelectOption) => {
    const isSelected = option.value === selected?.value;
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
        className={styles.item}
        title={option.label}
        // 클릭해도 포커스는 검색 입력에 남는다
        onMouseDown={(e) => e.preventDefault()}
        onMouseMove={() => {
          if (!option.disabled && active !== option.value) setActive(option.value);
        }}
        onClick={() => choose(option)}
      >
        <span className={styles.itemContent}>
          <OptionBody option={option} />
          <span className={styles.itemText}>{option.label}</span>
        </span>
        {isSelected ? (
          <span className={styles.check}>
            <CheckIcon />
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <RadixPopover.Root
      open={open}
      onOpenChange={(next) => {
        if (next) openList();
        else setOpen(false);
      }}
    >
      <RadixPopover.Trigger asChild>
        <button
          type="button"
          id={triggerId}
          role="combobox"
          aria-expanded={open}
          className={styles.trigger}
          data-placeholder={selected ? undefined : ""}
          disabled={disabled}
          title={selected?.label}
          onKeyDown={onTriggerKeyDown}
        >
          <span className={styles.triggerValue}>
            {selected?.icon ? (
              <span className={styles.itemIcon} aria-hidden="true">
                {selected.icon}
              </span>
            ) : null}
            <span className={styles.valueText}>{selected ? selected.label : placeholder}</span>
          </span>
          <span className={styles.chevron} aria-hidden="true">
            <ChevronIcon />
          </span>
        </button>
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          className={[styles.content, styles.searchContent].join(" ")}
          align="start"
          sideOffset={4}
          collisionPadding={8}
          aria-label={label}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <div className={styles.search}>
            <input
              ref={inputRef}
              className={styles.searchInput}
              type="text"
              role="combobox"
              aria-label={`${label} 검색`}
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeVisible ? optionId(active!) : undefined}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => {
                const q = e.target.value;
                setQuery(q);
                const lower = q.trim().toLocaleLowerCase();
                const first = options.find((o) => !o.disabled && o.label.toLocaleLowerCase().includes(lower));
                setActive(first?.value ?? null);
              }}
              onKeyDown={onInputKeyDown}
            />
          </div>
          <div id={listId} role="listbox" aria-label={label} className={styles.viewport}>
            {groups.map((g, gi) =>
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
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}

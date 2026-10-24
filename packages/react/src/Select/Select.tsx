import { useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Select as RadixSelect } from "radix-ui";
import { Popover } from "../Popover/Popover";
import { CheckIcon, ChevronIcon, OptionIcon, OptionList, groupOptions } from "./OptionList";
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
  /**
   * 높이. compact는 32px — 버튼(32px)·필터 줄과 맞출 때(Atlassian textfield/select isCompact). 기본은 40px.
   * @default 'default'
   */
  size?: "default" | "compact";
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
  size = "default",
}: SelectProps) {
  const triggerClass = [styles.trigger, size === "compact" ? styles.compact : null].filter(Boolean).join(" ");
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
          triggerClass={triggerClass}
        />
      ) : (
        <RadixSelect.Root
          value={value}
          defaultValue={defaultValue}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <RadixSelect.Trigger id={triggerId} className={triggerClass} title={selected?.label}>
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
        <OptionIcon option={option} />
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
  triggerClass: string;
}

/**
 * 검색 입력이 붙는 선택 — Radix Select는 목록 안 입력을 지원하지 않아 Popover + OptionList(MultiSelect와 공유)로 만든다.
 * 키보드: 트리거 ↓/↑/Enter/Space로 열기, 입력에서 ↑↓·Home·End 이동, Enter 선택, Esc·Tab 닫기(포커스는 트리거로).
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
  triggerClass,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const focusRef = useRef<HTMLElement | null>(null);

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      label={label}
      padding="none"
      className={[styles.content, styles.searchContent].join(" ")}
      initialFocusRef={focusRef}
      trigger={
        <button
          type="button"
          id={triggerId}
          role="combobox"
          aria-expanded={open}
          className={triggerClass}
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
      }
    >
      <OptionList
        label={label}
        options={options}
        selected={selected ? [selected.value] : []}
        searchable
        searchPlaceholder={searchPlaceholder}
        noOptionsMessage={noOptionsMessage}
        focusRef={focusRef}
        onPick={(option) => {
          onSelect(option.value);
          setOpen(false);
        }}
        // 목록 안에 다른 포커스 대상이 없다 — Tab은 닫고 트리거로 돌아간다
        onTab={() => setOpen(false)}
      />
    </Popover>
  );
}

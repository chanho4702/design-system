import { useId, useState } from "react";
import type { ReactNode } from "react";
import { Select as RadixSelect } from "radix-ui";
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
}: SelectProps) {
  const autoId = useId();
  const triggerId = id ?? autoId;
  // Radix의 Value는 선택된 항목의 ItemText만 복제하므로 아이콘은 따라오지 않는다.
  // 트리거에도 같은 아이콘을 그리려고 현재 값을 따로 따라간다(제어 시에는 value가 곧 답).
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const currentValue = value ?? uncontrolledValue;
  const selectedIcon = options.find((option) => option.value === currentValue)?.icon;

  const handleValueChange = (next: string) => {
    if (value === undefined) setUncontrolledValue(next);
    onValueChange?.(next);
  };

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <label className={styles.label} htmlFor={triggerId}>
        {label}
      </label>
      <RadixSelect.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <RadixSelect.Trigger id={triggerId} className={styles.trigger}>
          <span className={styles.triggerValue}>
            {selectedIcon ? (
              <span className={styles.itemIcon} aria-hidden="true">
                {selectedIcon}
              </span>
            ) : null}
            <RadixSelect.Value placeholder={placeholder} />
          </span>
          <RadixSelect.Icon>
            <ChevronIcon />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content className={styles.content} position="popper" sideOffset={4}>
            <RadixSelect.Viewport>
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  className={styles.item}
                  disabled={option.disabled}
                >
                  <span className={styles.itemContent}>
                    {option.icon ? (
                      <span className={styles.itemIcon} aria-hidden="true">
                        {option.icon}
                      </span>
                    ) : null}
                    <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  </span>
                  <RadixSelect.ItemIndicator>
                    <ChevronIcon />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
}

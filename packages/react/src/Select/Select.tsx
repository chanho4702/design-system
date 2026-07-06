import { useId } from "react";
import { Select as RadixSelect } from "radix-ui";
import styles from "./Select.module.css";

export interface SelectOption {
  value: string;
  label: string;
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
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <label className={styles.label} htmlFor={triggerId}>
        {label}
      </label>
      <RadixSelect.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <RadixSelect.Trigger id={triggerId} className={styles.trigger}>
          <RadixSelect.Value placeholder={placeholder} />
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
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
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

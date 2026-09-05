import { useId } from "react";
import type { ComponentPropsWithRef } from "react";
import { Checkbox as RadixCheckbox } from "radix-ui";
import styles from "./Checkbox.module.css";

export interface CheckboxProps extends ComponentPropsWithRef<typeof RadixCheckbox.Root> {
  /** 라벨 텍스트. 접근성을 위해 필수이며 체크박스와 자동 연결된다. */
  label: string;
  /**
   * true면 라벨을 시각적으로만 숨긴다 — 접근 이름은 그대로 남는다.
   * 표 헤더의 "모두 선택"이나 행마다 붙는 선택 체크박스처럼 글자를 둘 자리가 없을 때 쓴다.
   */
  labelHidden?: boolean;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true">
      <path
        d="M2.5 6.5L5 9l4.5-5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Checkbox({ label, labelHidden = false, id, className, ...rest }: CheckboxProps) {
  const autoId = useId();
  const checkboxId = id ?? autoId;
  return (
    <span className={[styles.wrapper, className].filter(Boolean).join(" ")}>
      <RadixCheckbox.Root id={checkboxId} className={styles.box} {...rest}>
        <RadixCheckbox.Indicator className={styles.indicator}>
          <CheckIcon />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <label
        className={[styles.label, labelHidden ? styles.labelHidden : null].filter(Boolean).join(" ")}
        htmlFor={checkboxId}
      >
        {label}
      </label>
    </span>
  );
}

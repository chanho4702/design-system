import { useId } from "react";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { Checkbox as RadixCheckbox } from "radix-ui";
import styles from "./Checkbox.module.css";

export interface CheckboxProps extends ComponentPropsWithRef<typeof RadixCheckbox.Root> {
  /**
   * 라벨. 문자열 외에 아이콘·배지 같은 노드도 받는다.
   * 접근 이름은 이 라벨 요소에서 나온다(`aria-labelledby`) — 소비자가 `aria-label`이나
   * `aria-labelledby`를 직접 주면 그쪽이 이긴다.
   */
  label: ReactNode;
  /**
   * true면 라벨을 시각적으로만 숨긴다 — 접근 이름은 그대로 남는다.
   * 표 헤더의 "모두 선택"이나 행마다 붙는 선택 체크박스처럼 글자를 둘 자리가 없을 때 쓴다.
   */
  labelHidden?: boolean;
}

/* lucide Check(M20 6 9 17l-5-5)를 12px 박스로 옮긴 것 — lucide-react는 이 패키지의 의존성이 아니라 인라인으로 그린다. */
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      data-icon="check"
      viewBox="0 0 12 12"
      width="12"
      height="12"
      fill="none"
      aria-hidden="true"
    >
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

/* lucide Minus(M5 12h14)를 같은 12px 박스·같은 획 두께로 옮긴 것 — 부분 선택(중간 상태) 표시. */
function MinusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      data-icon="minus"
      viewBox="0 0 12 12"
      width="12"
      height="12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 6h7"
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
  // Radix의 Root는 button이라 label[for]만으로는 이름이 붙지 않는 브라우저가 있다.
  // 라벨 요소를 aria-labelledby로 직접 가리켜, 라벨이 노드여도 이름이 그 안 텍스트로 잡힌다.
  const labelId = `${checkboxId}-label`;
  const hasOwnName = rest["aria-label"] != null || rest["aria-labelledby"] != null;
  return (
    <span className={[styles.wrapper, className].filter(Boolean).join(" ")}>
      <RadixCheckbox.Root
        id={checkboxId}
        className={styles.box}
        aria-labelledby={hasOwnName ? undefined : labelId}
        {...rest}
      >
        <RadixCheckbox.Indicator className={styles.indicator}>
          <CheckIcon className={styles.iconChecked} />
          <MinusIcon className={styles.iconIndeterminate} />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <label
        id={labelId}
        className={[styles.label, labelHidden ? styles.labelHidden : null].filter(Boolean).join(" ")}
        htmlFor={checkboxId}
      >
        {label}
      </label>
    </span>
  );
}

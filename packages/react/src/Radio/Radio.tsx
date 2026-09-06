import { useId } from "react";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { RadioGroup as RadixRadioGroup } from "radix-ui";
import styles from "./Radio.module.css";

export type RadioGroupProps = ComponentPropsWithRef<typeof RadixRadioGroup.Root>;

/** 라디오 버튼 묶음. 화살표 키 이동·단일 선택은 Radix가 처리한다. */
export function RadioGroup({ className, ...rest }: RadioGroupProps) {
  return (
    <RadixRadioGroup.Root
      className={[styles.group, className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
}

export interface RadioProps extends ComponentPropsWithRef<typeof RadixRadioGroup.Item> {
  /**
   * 라벨. 문자열 외에 아이콘·배지 같은 노드도 받는다.
   * 접근 이름은 이 라벨 요소에서 나온다(`aria-labelledby`) — 소비자가 `aria-label`이나
   * `aria-labelledby`를 직접 주면 그쪽이 이긴다.
   */
  label: ReactNode;
}

export function Radio({ label, id, className, ...rest }: RadioProps) {
  const autoId = useId();
  const radioId = id ?? autoId;
  // Radix의 Root는 button이라 label[for]만으로는 이름이 붙지 않는 브라우저가 있다.
  // 라벨 요소를 aria-labelledby로 직접 가리켜, 라벨이 노드여도 이름이 그 안 텍스트로 잡힌다.
  const labelId = `${radioId}-label`;
  const hasOwnName = rest["aria-label"] != null || rest["aria-labelledby"] != null;
  return (
    <span className={[styles.item, className].filter(Boolean).join(" ")}>
      <RadixRadioGroup.Item
        id={radioId}
        className={styles.circle}
        aria-labelledby={hasOwnName ? undefined : labelId}
        {...rest}
      >
        <RadixRadioGroup.Indicator className={styles.indicator} />
      </RadixRadioGroup.Item>
      <label id={labelId} className={styles.label} htmlFor={radioId}>
        {label}
      </label>
    </span>
  );
}

import { useId } from "react";
import type { ComponentPropsWithRef } from "react";
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
  /** 라벨 텍스트. 접근성을 위해 필수이며 radio와 자동 연결된다. */
  label: string;
}

export function Radio({ label, id, className, ...rest }: RadioProps) {
  const autoId = useId();
  const radioId = id ?? autoId;
  return (
    <span className={[styles.item, className].filter(Boolean).join(" ")}>
      <RadixRadioGroup.Item id={radioId} className={styles.circle} {...rest}>
        <RadixRadioGroup.Indicator className={styles.indicator} />
      </RadixRadioGroup.Item>
      <label className={styles.label} htmlFor={radioId}>
        {label}
      </label>
    </span>
  );
}

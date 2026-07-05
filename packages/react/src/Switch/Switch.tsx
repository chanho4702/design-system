import { useId } from "react";
import type { ComponentPropsWithRef } from "react";
import { Switch as RadixSwitch } from "radix-ui";
import styles from "./Switch.module.css";

export interface SwitchProps extends ComponentPropsWithRef<typeof RadixSwitch.Root> {
  /** 라벨 텍스트. 접근성을 위해 필수이며 switch와 자동 연결된다. */
  label: string;
}

export function Switch({ label, id, className, ...rest }: SwitchProps) {
  const autoId = useId();
  const switchId = id ?? autoId;
  return (
    <span className={[styles.wrapper, className].filter(Boolean).join(" ")}>
      <RadixSwitch.Root id={switchId} className={styles.track} {...rest}>
        <RadixSwitch.Thumb className={styles.thumb} />
      </RadixSwitch.Root>
      <label className={styles.label} htmlFor={switchId}>
        {label}
      </label>
    </span>
  );
}

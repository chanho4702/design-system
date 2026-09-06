import { useId } from "react";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { Switch as RadixSwitch } from "radix-ui";
import styles from "./Switch.module.css";

export interface SwitchProps extends ComponentPropsWithRef<typeof RadixSwitch.Root> {
  /**
   * 라벨. 문자열 외에 아이콘·배지 같은 노드도 받는다.
   * 접근 이름은 이 라벨 요소에서 나온다(`aria-labelledby`) — 소비자가 `aria-label`이나
   * `aria-labelledby`를 직접 주면 그쪽이 이긴다.
   */
  label: ReactNode;
}

export function Switch({ label, id, className, ...rest }: SwitchProps) {
  const autoId = useId();
  const switchId = id ?? autoId;
  // Radix의 Root는 button이라 label[for]만으로는 이름이 붙지 않는 브라우저가 있다.
  // 라벨 요소를 aria-labelledby로 직접 가리켜, 라벨이 노드여도 이름이 그 안 텍스트로 잡힌다.
  const labelId = `${switchId}-label`;
  const hasOwnName = rest["aria-label"] != null || rest["aria-labelledby"] != null;
  return (
    <span className={[styles.wrapper, className].filter(Boolean).join(" ")}>
      <RadixSwitch.Root
        id={switchId}
        className={styles.track}
        aria-labelledby={hasOwnName ? undefined : labelId}
        {...rest}
      >
        <RadixSwitch.Thumb className={styles.thumb} />
      </RadixSwitch.Root>
      <label id={labelId} className={styles.label} htmlFor={switchId}>
        {label}
      </label>
    </span>
  );
}

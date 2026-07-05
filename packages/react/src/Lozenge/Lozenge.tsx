import type { ComponentPropsWithRef } from "react";
import styles from "./Lozenge.module.css";

export interface LozengeProps extends ComponentPropsWithRef<"span"> {
  /**
   * 상태의 의미. 지라식 상태 라벨: neutral(할 일), info(진행 중), success(완료),
   * warning(주의), danger(차단됨).
   * @default 'neutral'
   */
  appearance?: "neutral" | "info" | "success" | "warning" | "danger";
}

export function Lozenge({ appearance = "neutral", className, ...rest }: LozengeProps) {
  const cls = [styles.lozenge, styles[appearance], className].filter(Boolean).join(" ");
  return <span className={cls} {...rest} />;
}

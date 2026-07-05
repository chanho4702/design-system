import type { ComponentPropsWithRef } from "react";
import styles from "./Badge.module.css";

export interface BadgeProps extends ComponentPropsWithRef<"span"> {
  /**
   * 시각적 스타일. brand는 강조 카운트, danger는 경고성 카운트에 사용한다.
   * @default 'neutral'
   */
  appearance?: "neutral" | "brand" | "danger";
}

export function Badge({ appearance = "neutral", className, ...rest }: BadgeProps) {
  const cls = [styles.badge, styles[appearance], className].filter(Boolean).join(" ");
  return <span className={cls} {...rest} />;
}

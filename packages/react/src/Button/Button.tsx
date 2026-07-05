import type { ComponentPropsWithRef } from "react";
import styles from "./Button.module.css";

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  /**
   * 시각적 스타일. primary는 화면의 핵심 액션 하나에만 사용한다.
   * @default 'primary'
   */
  variant?: "primary" | "subtle" | "danger";
  /**
   * 크기. 밀도 높은 UI(테이블 행 등)에는 small을 사용한다.
   * @default 'medium'
   */
  size?: "medium" | "small";
}

export function Button({
  variant = "primary",
  size = "medium",
  type = "button",
  className,
  ...rest
}: ButtonProps) {
  const cls = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(" ");
  return <button type={type} className={cls} {...rest} />;
}

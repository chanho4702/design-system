import type { ComponentPropsWithRef } from "react";
import styles from "./Spinner.module.css";

export interface SpinnerProps extends ComponentPropsWithRef<"span"> {
  /**
   * 크기(16/24/32px). 버튼 안에는 small, 페이지 로딩에는 large를 사용한다.
   * @default 'medium'
   */
  size?: "small" | "medium" | "large";
  /**
   * 스크린리더가 읽을 라벨.
   * @default '로딩 중'
   */
  label?: string;
}

export function Spinner({ size = "medium", label = "로딩 중", className, ...rest }: SpinnerProps) {
  const cls = [styles.spinner, styles[size], className].filter(Boolean).join(" ");
  return <span role="status" aria-label={label} className={cls} {...rest} />;
}

import { useId } from "react";
import type { ComponentPropsWithRef } from "react";
import styles from "./TextField.module.css";

export interface TextFieldProps extends Omit<ComponentPropsWithRef<"input">, "size"> {
  /**
   * 높이. compact는 32px — 버튼(32px)·필터 줄과 맞출 때(Atlassian textfield isCompact). 기본 40px.
   * 숫자를 주면 예전처럼 네이티브 `size` 속성(글자 수 폭)으로 넘어간다.
   * @default 'default'
   */
  size?: "default" | "compact" | number;
  /** 라벨 텍스트. 접근성을 위해 필수이며 input과 자동 연결된다. */
  label: string;
  /** 입력 아래 표시되는 보조 설명. */
  description?: string;
  /** 에러 메시지. 지정하면 aria-invalid와 에러 스타일이 적용된다. */
  error?: string;
}

/**
 * 한 줄 텍스트 입력. ref는 내부 input으로, className은 루트 래퍼로 전달된다.
 */
export function TextField({ label, description, error, id, className, size = "default", ...rest }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const descId = `${inputId}-desc`;
  const errorId = `${inputId}-error`;
  const describedBy =
    [description ? descId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className={[styles.input, size === "compact" ? styles.compact : null, error ? styles.invalid : null]
          .filter(Boolean)
          .join(" ")}
        size={typeof size === "number" ? size : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {description ? (
        <p id={descId} className={styles.description}>
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

import { useId } from "react";
import type { ComponentPropsWithRef } from "react";
import styles from "./TextField.module.css";

export interface TextFieldProps extends ComponentPropsWithRef<"input"> {
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
export function TextField({ label, description, error, id, className, ...rest }: TextFieldProps) {
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
        className={[styles.input, error ? styles.invalid : null].filter(Boolean).join(" ")}
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

import { useId } from "react";
import type { ComponentPropsWithRef } from "react";
import styles from "./TextArea.module.css";

export interface TextAreaProps extends ComponentPropsWithRef<"textarea"> {
  label: string;
  description?: string;
  error?: string;
}

export function TextArea({ label, description, error, id, className, ...rest }: TextAreaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const descId = `${textareaId}-desc`;
  const errorId = `${textareaId}-error`;
  const describedBy =
    [description ? descId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <label className={styles.label} htmlFor={textareaId}>
        {label}
      </label>
      <textarea
        id={textareaId}
        className={[styles.textarea, error ? styles.invalid : null].filter(Boolean).join(" ")}
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

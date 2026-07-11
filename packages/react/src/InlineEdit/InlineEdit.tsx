import { useRef, useState } from "react";
import styles from "./InlineEdit.module.css";

export interface InlineEditProps {
  /** 현재 값. 보기 모드에 표시되고 편집 시작 시 초안의 기준이 된다. */
  value: string;
  /** 저장 시 호출된다. 공백을 제거한 값이 기존 값과 다를 때만 발생한다. */
  onSave: (value: string) => void;
  /** 보기 모드 텍스트 스타일 클래스 (제목 등). */
  viewClassName?: string;
  /** 편집 컨트롤의 접근 가능 라벨. 보기 버튼은 "{label} 편집"으로 노출된다. */
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Confluence식 클릭-편집. 보기 모드를 클릭하면 인풋으로 전환되고,
 * Enter 또는 체크 버튼으로 저장, Escape 또는 × 버튼으로 취소한다.
 */
export function InlineEdit({
  value,
  onSave,
  viewClassName,
  label,
  placeholder,
  disabled = false,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const start = () => {
    if (disabled) return;
    setDraft(value);
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  };
  const save = () => {
    setEditing(false);
    if (draft.trim() && draft !== value) onSave(draft.trim());
  };
  const cancel = () => setEditing(false);

  if (!editing) {
    return (
      <button
        type="button"
        className={[styles.view, disabled ? styles.disabled : null, viewClassName]
          .filter(Boolean)
          .join(" ")}
        onClick={start}
        aria-label={`${label} 편집`}
        disabled={disabled}
      >
        {value || <span className={styles.placeholder}>{placeholder}</span>}
        <span className={styles.pencil} aria-hidden="true">
          ✎
        </span>
      </button>
    );
  }

  return (
    <div className={styles.editor}>
      <input
        ref={inputRef}
        className={styles.input}
        aria-label={label}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") cancel();
        }}
        autoFocus
      />
      <div className={styles.controls}>
        <button
          type="button"
          className={[styles.control, styles.confirm].join(" ")}
          aria-label="저장"
          onClick={save}
        >
          ✓
        </button>
        <button type="button" className={styles.control} aria-label="취소" onClick={cancel}>
          ×
        </button>
      </div>
    </div>
  );
}

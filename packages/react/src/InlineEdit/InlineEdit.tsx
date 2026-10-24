import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Popover as RadixPopover } from "radix-ui";
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
  const viewRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const wasEditing = useRef(false);

  // 편집을 마치면(저장·취소) 포커스를 보기 버튼으로 돌려준다 — 키보드 사용자가 자리를 잃지 않게.
  // 다음 프레임에 옮긴다 — 같은 Enter 키의 keypress가 새로 포커스된 보기 버튼을 눌러 편집이 다시 열리지 않게.
  useEffect(() => {
    if (wasEditing.current && !editing) {
      const frame = requestAnimationFrame(() => viewRef.current?.focus());
      wasEditing.current = editing;
      return () => cancelAnimationFrame(frame);
    }
    wasEditing.current = editing;
  }, [editing]);

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
        ref={viewRef}
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

  // 확인/취소 버튼은 포털 팝오버로 띄운다 — 스크롤 컨테이너·모달 본문(overflow)에 잘리지 않고,
  // 아래 공간이 없으면 위로 뒤집힌다. 팝오버가 맨 위 레이어가 되므로 Esc는 편집만 취소하고
  // 바깥 모달까지 닫지 않는다.
  const onControlKeyDown = (e: KeyboardEvent<HTMLButtonElement>, first: boolean) => {
    // 포털이라 문서 순서상 인풋 바로 뒤가 아니다 — Tab 순서를 인풋 → 저장 → 취소 → 인풋으로 잇는다.
    if (e.key !== "Tab") return;
    if (first && e.shiftKey) {
      e.preventDefault();
      inputRef.current?.focus();
    } else if (!first && !e.shiftKey) {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  return (
    <RadixPopover.Root open modal={false}>
      <RadixPopover.Anchor asChild>
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
              if (e.key === "Tab" && !e.shiftKey) {
                e.preventDefault();
                confirmRef.current?.focus();
              }
            }}
            autoFocus
          />
        </div>
      </RadixPopover.Anchor>
      <RadixPopover.Portal>
        <RadixPopover.Content
          className={styles.controls}
          role="group"
          aria-label={`${label} 편집 동작`}
          side="bottom"
          align="end"
          sideOffset={4}
          collisionPadding={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            cancel();
          }}
          // 바깥을 눌러도 편집은 유지한다(기존 동작) — 저장·취소는 버튼/Enter/Esc로만.
          onInteractOutside={(e) => e.preventDefault()}
        >
          <button
            ref={confirmRef}
            type="button"
            className={[styles.control, styles.confirm].join(" ")}
            aria-label="저장"
            onClick={save}
            onKeyDown={(e) => onControlKeyDown(e, true)}
          >
            ✓
          </button>
          <button
            type="button"
            className={styles.control}
            aria-label="취소"
            onClick={cancel}
            onKeyDown={(e) => onControlKeyDown(e, false)}
          >
            ×
          </button>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}

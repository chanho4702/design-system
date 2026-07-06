import type { ReactElement, ReactNode } from "react";
import { Dialog as RadixDialog } from "radix-ui";
import styles from "./Modal.module.css";

export interface ModalProps {
  /** 클릭 시 모달을 여는 트리거 요소. */
  trigger: ReactElement;
  /** 모달 제목. dialog의 접근 가능 이름이 된다. */
  title: string;
  /** 제목 아래 보조 설명. dialog의 접근 가능 설명이 된다. */
  description?: string;
  children?: ReactNode;
  /** 제어 모드 열림 상태. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 콘텐츠 패널에 병합되는 클래스. */
  className?: string;
}

function XIcon() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true">
      <path
        d="M3 3l6 6M9 3l-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Modal({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange,
  className,
}: ModalProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={styles.overlay} />
        <RadixDialog.Content
          className={[styles.content, className].filter(Boolean).join(" ")}
          {...(description ? {} : { "aria-describedby": undefined })}
        >
          <div className={styles.header}>
            <RadixDialog.Title className={styles.title}>{title}</RadixDialog.Title>
            <RadixDialog.Close asChild>
              <button type="button" className={styles.close} aria-label="닫기">
                <XIcon />
              </button>
            </RadixDialog.Close>
          </div>
          {description ? (
            <RadixDialog.Description className={styles.description}>
              {description}
            </RadixDialog.Description>
          ) : null}
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

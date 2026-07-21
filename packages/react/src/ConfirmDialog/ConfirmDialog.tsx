import type { ReactNode } from "react";
import { Button } from "../Button/Button";
import { Modal } from "../Modal/Modal";
import styles from "./ConfirmDialog.module.css";

export interface ConfirmDialogProps {
  /** 제어형 열림 상태. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 다이얼로그 제목(접근 가능 이름). */
  title: string;
  /** 제목 아래 보조 설명. */
  description?: string;
  /** 확인 버튼 라벨. @default '확인' */
  confirmLabel?: string;
  /** 취소 버튼 라벨. @default '취소' */
  cancelLabel?: string;
  /** true면 확인 버튼을 danger로 표시(삭제 등 파괴적 액션). */
  danger?: boolean;
  /** true면 확인 버튼에 스피너를 표시하고 두 버튼을 잠근다. */
  loading?: boolean;
  /** 확인 클릭 시 호출. 닫기는 호출측에서 open을 제어한다. */
  onConfirm: () => void;
  /** 설명 아래 추가 콘텐츠. */
  children?: ReactNode;
}

/**
 * 확인/취소 다이얼로그. Modal을 감싼 표준 confirm 패턴이다.
 * 트리거 없이 제어형으로 열도록 설계됐다(예: Dropdown "삭제" 클릭 → 열기).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  danger = false,
  loading = false,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} description={description}>
      {children}
      <div className={styles.footer}>
        <Button variant="subtle" onClick={() => onOpenChange(false)} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={danger ? "danger" : "primary"} loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

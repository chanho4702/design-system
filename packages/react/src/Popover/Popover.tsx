import type { ReactElement, ReactNode, RefObject } from "react";
import { Popover as RadixPopover } from "radix-ui";
import styles from "./Popover.module.css";

export interface PopoverProps {
  /** 클릭으로 여닫는 트리거. 포커스 가능한 요소(버튼 등)여야 한다. */
  trigger: ReactElement;
  children: ReactNode;
  /** 제어형 열림 상태. */
  open?: boolean;
  /** 비제어 초기 열림. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 트리거 기준 방향. 공간이 없으면 반대편으로 뒤집힌다. @default 'bottom' */
  side?: "top" | "right" | "bottom" | "left";
  /** 트리거 기준 정렬. @default 'start' */
  align?: "start" | "center" | "end";
  /** 대화상자(`role="dialog"`)의 접근 이름. 제목이 없는 팝오버에는 꼭 준다. */
  label?: string;
  /** 콘텐츠에 병합되는 클래스 — 폭·패딩 등은 이 클래스가 기본값을 이긴다. */
  className?: string;
  /** 열릴 때 포커스를 줄 요소. 생략하면 콘텐츠 안 첫 포커스 가능 요소로 간다. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** true면 최소 폭을 트리거 폭에 맞춘다(선택 목록류). */
  matchTriggerWidth?: boolean;
  /** 안쪽 여백. 목록처럼 가장자리까지 채우는 내용은 none. @default 'default' */
  padding?: "default" | "none";
}

/**
 * 트리거에 붙어 뜨는 비모달 오버레이(Atlassian `@atlaskit/popup`).
 * 포털로 body에 붙어 모달·스크롤 컨테이너에 잘리지 않고, 화면 가장자리에서는 8px 띄워 뒤집기·이동한다.
 * 열리면 콘텐츠로 포커스가 들어가고, Esc·바깥 클릭으로 닫히면 트리거로 돌아온다.
 * 표면은 Dropdown과 같다(surface-overlay·반경 8·shadow-overlay).
 */
export function Popover({
  trigger,
  children,
  open,
  defaultOpen,
  onOpenChange,
  side = "bottom",
  align = "start",
  label,
  className,
  initialFocusRef,
  matchTriggerWidth = false,
  padding = "default",
}: PopoverProps) {
  return (
    <RadixPopover.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          className={[
            styles.content,
            padding === "none" ? styles.paddingNone : null,
            matchTriggerWidth ? styles.matchTrigger : null,
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          side={side}
          align={align}
          sideOffset={4}
          collisionPadding={8}
          aria-label={label}
          onOpenAutoFocus={
            initialFocusRef
              ? (e) => {
                  e.preventDefault();
                  initialFocusRef.current?.focus();
                }
              : undefined
          }
        >
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}

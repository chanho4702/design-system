import type { ReactElement, ReactNode } from "react";
import { Tooltip as RadixTooltip } from "radix-ui";
import styles from "./Tooltip.module.css";

export interface TooltipProps {
  /** 툴팁 안에 표시할 내용. */
  content: ReactNode;
  /** 트리거 요소. 키보드 접근을 위해 포커스 가능해야 한다. */
  children: ReactElement;
  /**
   * 표시 위치.
   * @default 'top'
   */
  side?: "top" | "right" | "bottom" | "left";
  /**
   * 호버 후 표시까지의 지연(ms).
   * @default 300
   */
  delayDuration?: number;
  /** 툴팁 콘텐츠에 병합되는 클래스. */
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = "top",
  delayDuration = 300,
  className,
}: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className={[styles.content, className].filter(Boolean).join(" ")}
            side={side}
            sideOffset={6}
          >
            {content}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}

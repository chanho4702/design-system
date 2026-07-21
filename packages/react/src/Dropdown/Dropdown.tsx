import type { ReactElement, ReactNode } from "react";
import { DropdownMenu as RadixDropdownMenu } from "radix-ui";
import styles from "./Dropdown.module.css";

export interface DropdownItem {
  label?: string;
  /** 라벨 앞에 놓이는 아이콘. */
  icon?: ReactNode;
  /** 항목 선택 시 호출된다. */
  onSelect?: () => void;
  /** 파괴적 액션 표시(빨간 텍스트). */
  danger?: boolean;
  disabled?: boolean;
  /** true면 항목 대신 그룹 구분선을 렌더한다(label 불필요). */
  separator?: boolean;
}

export interface DropdownProps {
  /** 클릭 시 메뉴를 여는 트리거 요소. */
  trigger: ReactElement;
  items: DropdownItem[];
  /** 메뉴 콘텐츠에 병합되는 클래스. */
  className?: string;
}

export function Dropdown({ trigger, items, className }: DropdownProps) {
  return (
    <RadixDropdownMenu.Root>
      <RadixDropdownMenu.Trigger asChild>{trigger}</RadixDropdownMenu.Trigger>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          className={[styles.content, className].filter(Boolean).join(" ")}
          sideOffset={4}
          align="start"
        >
          {items.map((item, i) =>
            item.separator ? (
              <RadixDropdownMenu.Separator key={`sep-${i}`} className={styles.separator} />
            ) : (
              <RadixDropdownMenu.Item
                key={item.label ?? i}
                className={[styles.item, item.danger ? styles.danger : null]
                  .filter(Boolean)
                  .join(" ")}
                disabled={item.disabled}
                onSelect={item.onSelect}
              >
                {item.icon ? (
                  <span className={styles.itemIcon} aria-hidden="true">
                    {item.icon}
                  </span>
                ) : null}
                {item.label}
              </RadixDropdownMenu.Item>
            ),
          )}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
}

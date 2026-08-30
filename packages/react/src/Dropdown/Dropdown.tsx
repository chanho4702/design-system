import type { ReactElement, ReactNode } from "react";
import { DropdownMenu as RadixDropdownMenu } from "radix-ui";
import styles from "./Dropdown.module.css";

export interface DropdownItem {
  label?: string;
  /** 라벨 아래 한 줄 설명(지라 설정 메뉴처럼 "무엇을 관리하는 곳인지"). */
  description?: string;
  /** 라벨 앞에 놓이는 아이콘. description이 있으면 아이콘은 두 줄 높이에 맞춰 위로 정렬된다. */
  icon?: ReactNode;
  /** 항목 선택 시 호출된다. */
  onSelect?: () => void;
  /** 파괴적 액션 표시(빨간 텍스트). */
  danger?: boolean;
  disabled?: boolean;
  /** true면 항목 대신 그룹 구분선을 렌더한다(label 불필요). */
  separator?: boolean;
  /** 지정하면 항목 대신 그룹 제목(선택 불가)을 렌더한다. */
  heading?: string;
}

export interface DropdownProps {
  /** 클릭 시 메뉴를 여는 트리거 요소. */
  trigger: ReactElement;
  items: DropdownItem[];
  /** 메뉴 콘텐츠에 병합되는 클래스. */
  className?: string;
  /**
   * 트리거 기준 정렬. 화면 오른쪽 끝의 트리거(상단바 아이콘 등)는 end를 쓴다.
   * @default 'start'
   */
  align?: "start" | "center" | "end";
}

export function Dropdown({ trigger, items, className, align = "start" }: DropdownProps) {
  return (
    <RadixDropdownMenu.Root>
      <RadixDropdownMenu.Trigger asChild>{trigger}</RadixDropdownMenu.Trigger>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          className={[styles.content, className].filter(Boolean).join(" ")}
          sideOffset={4}
          align={align}
        >
          {items.map((item, i) =>
            item.separator ? (
              <RadixDropdownMenu.Separator key={`sep-${i}`} className={styles.separator} />
            ) : item.heading !== undefined ? (
              <RadixDropdownMenu.Label key={`heading-${i}`} className={styles.heading}>
                {item.heading}
              </RadixDropdownMenu.Label>
            ) : (
              <RadixDropdownMenu.Item
                key={item.label ?? i}
                className={[
                  styles.item,
                  item.danger ? styles.danger : null,
                  item.description ? styles.itemRich : null,
                ]
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
                {item.description ? (
                  <span className={styles.itemText}>
                    <span className={styles.itemLabel}>{item.label}</span>
                    <span className={styles.itemDescription}>{item.description}</span>
                  </span>
                ) : (
                  item.label
                )}
              </RadixDropdownMenu.Item>
            ),
          )}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
}

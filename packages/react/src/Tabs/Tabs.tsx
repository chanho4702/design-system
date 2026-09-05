import type { ReactNode } from "react";
import { Tabs as RadixTabs } from "radix-ui";
import styles from "./Tabs.module.css";

export interface TabItem {
  value: string;
  /**
   * 탭에 표시되는 라벨. 문자열 외에 아이콘·배지 같은 노드도 받는다.
   * 노드를 넣으면 스크린리더 이름이 노드 안 텍스트를 이어붙인 값이 되므로,
   * 읽히는 이름을 고정하려면 `ariaLabel`을 함께 준다.
   */
  label: ReactNode;
  /** 탭의 접근 가능 이름. 지정하면 라벨 노드 대신 이 문자열이 읽힌다. */
  ariaLabel?: string;
  content: ReactNode;
}

export interface TabsProps {
  /** 탭 목록의 접근 가능 이름. */
  label: string;
  items: TabItem[];
  /** 비제어 초기 선택 탭. 생략하면 첫 항목. */
  defaultValue?: string;
  /** 제어 모드 선택 값. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** 루트에 병합되는 클래스. */
  className?: string;
}

export function Tabs({ label, items, defaultValue, value, onValueChange, className }: TabsProps) {
  return (
    <RadixTabs.Root
      className={[styles.root, className].filter(Boolean).join(" ")}
      defaultValue={defaultValue ?? items[0]?.value}
      value={value}
      onValueChange={onValueChange}
    >
      <RadixTabs.List className={styles.list} aria-label={label}>
        {items.map((item) => (
          <RadixTabs.Trigger
            key={item.value}
            className={styles.trigger}
            value={item.value}
            aria-label={item.ariaLabel}
          >
            {item.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {items.map((item) => (
        <RadixTabs.Content key={item.value} className={styles.content} value={item.value}>
          {item.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}

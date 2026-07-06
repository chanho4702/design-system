import type { ReactNode } from "react";
import { Tabs as RadixTabs } from "radix-ui";
import styles from "./Tabs.module.css";

export interface TabItem {
  value: string;
  label: string;
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
          <RadixTabs.Trigger key={item.value} className={styles.trigger} value={item.value}>
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

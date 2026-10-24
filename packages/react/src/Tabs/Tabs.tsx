import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
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

interface IndicatorBox {
  x: number;
  w: number;
  /** 첫 배치는 제자리에 그리고, 그 뒤 바뀔 때만 미끄러진다 */
  animate: boolean;
}

export function Tabs({ label, items, defaultValue, value, onValueChange, className }: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [innerValue, setInnerValue] = useState(defaultValue ?? items[0]?.value);
  const current = value ?? innerValue;
  const [indicator, setIndicator] = useState<IndicatorBox | null>(null);

  // 선택 밑줄 — 탭마다 따로 그리지 않고 하나를 선택 탭 위치로 옮긴다(리니어·Atlassian 탭).
  // 측정 전·측정 불가(폭 0)일 때는 CSS가 선택 탭 자체의 밑줄로 그린다.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const tab = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
      if (!tab || tab.offsetWidth === 0) {
        setIndicator(null);
        return;
      }
      const x = tab.offsetLeft;
      const w = tab.offsetWidth;
      setIndicator((prev) =>
        prev && prev.x === x && prev.w === w ? prev : { x, w, animate: prev !== null },
      );
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    list.querySelectorAll('[role="tab"]').forEach((tab) => observer.observe(tab));
    return () => observer.disconnect();
  }, [current, items]);

  return (
    <RadixTabs.Root
      className={[styles.root, className].filter(Boolean).join(" ")}
      defaultValue={defaultValue ?? items[0]?.value}
      value={value}
      onValueChange={(next) => {
        setInnerValue(next);
        onValueChange?.(next);
      }}
    >
      <RadixTabs.List
        ref={listRef}
        className={styles.list}
        aria-label={label}
        data-indicator={indicator ? "" : undefined}
      >
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
        {indicator ? (
          <span
            className={styles.indicator}
            aria-hidden="true"
            data-animate={indicator.animate ? "" : undefined}
            style={{ "--_chanho-tabs-indicator-x": `${indicator.x}px`, "--_chanho-tabs-indicator-w": `${indicator.w}px` } as CSSProperties}
          />
        ) : null}
      </RadixTabs.List>
      {items.map((item) => (
        <RadixTabs.Content key={item.value} className={styles.content} value={item.value}>
          {item.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}

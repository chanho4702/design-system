import type { ReactElement, ReactNode } from "react";
import { ContextMenu as RadixContextMenu } from "radix-ui";
// 같은 시각 체계 — Dropdown의 표면·항목 스타일을 그대로 쓴다(오버레이 표면·반경 8·그림자 overlay).
import menu from "../Dropdown/Dropdown.module.css";
import styles from "./ContextMenu.module.css";

export interface ContextMenuItem {
  label?: string;
  /** 라벨 아래 한 줄 설명. */
  description?: string;
  /** 라벨 앞 아이콘(장식). */
  icon?: ReactNode;
  /** 항목 선택 시 호출된다. */
  onSelect?: () => void;
  /** 파괴적 액션(빨간 글자). */
  danger?: boolean;
  disabled?: boolean;
  /** true면 구분선. */
  separator?: boolean;
  /** 그룹 제목(선택 불가). */
  heading?: string;
  /** 지정하면 체크 항목(`menuitemcheckbox`) — true면 체크 표시. */
  checked?: boolean;
  /** 오른쪽 단축키 힌트(예: "⌘C", "Del"). 표시만 하며 바인딩은 소비 앱 몫이다. */
  shortcut?: string;
  /** 하위 메뉴 항목. 지정하면 이 항목은 하위 메뉴를 여는 트리거가 된다(→ 또는 Enter로 열기). */
  items?: ContextMenuItem[];
}

export interface ContextMenuProps {
  /**
   * 우클릭을 받을 영역. 키보드 사용자를 위해 포커스 가능해야 한다 —
   * 포커스된 상태에서 Shift+F10 또는 메뉴 키를 누르면 브라우저가 contextmenu를 보내 메뉴가 열린다.
   */
  children: ReactElement;
  items: ContextMenuItem[];
  /** 메뉴 콘텐츠에 병합되는 클래스. */
  className?: string;
  /** true면 우클릭 시 브라우저 기본 메뉴가 뜬다. */
  disabled?: boolean;
  /** 열림/닫힘 콜백. */
  onOpenChange?: (open: boolean) => void;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M6 3.5L10.5 8 6 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function itemClass(item: ContextMenuItem) {
  return [menu.item, item.danger ? menu.danger : null, item.description ? menu.itemRich : null]
    .filter(Boolean)
    .join(" ");
}

function Body({ item, trailing }: { item: ContextMenuItem; trailing?: ReactNode }) {
  return (
    <>
      {item.icon ? (
        <span className={menu.itemIcon} aria-hidden="true">
          {item.icon}
        </span>
      ) : null}
      {item.description ? (
        <span className={menu.itemText}>
          <span className={menu.itemLabel} title={item.label}>
            {item.label}
          </span>
          <span className={menu.itemDescription}>{item.description}</span>
        </span>
      ) : (
        <span className={menu.itemLabelText} title={item.label}>
          {item.label}
        </span>
      )}
      {item.shortcut ? (
        // 단축키는 접근 이름에서 빼고 aria-keyshortcuts로 따로 알린다
        <kbd className={styles.shortcut} aria-hidden="true">
          {item.shortcut}
        </kbd>
      ) : null}
      {trailing}
    </>
  );
}

function renderItems(items: ContextMenuItem[], className?: string): ReactNode {
  return items.map((item, i) => {
    if (item.separator) return <RadixContextMenu.Separator key={`sep-${i}`} className={menu.separator} />;
    if (item.heading !== undefined)
      return (
        <RadixContextMenu.Label key={`heading-${i}`} className={menu.heading}>
          {item.heading}
        </RadixContextMenu.Label>
      );
    const key = item.label ?? i;
    if (item.items) {
      return (
        <RadixContextMenu.Sub key={key}>
          <RadixContextMenu.SubTrigger className={itemClass(item)} disabled={item.disabled}>
            <Body
              item={item}
              trailing={
                <span className={styles.subIcon} aria-hidden="true">
                  <ChevronRightIcon />
                </span>
              }
            />
          </RadixContextMenu.SubTrigger>
          <RadixContextMenu.Portal>
            <RadixContextMenu.SubContent
              className={[menu.content, styles.content, className].filter(Boolean).join(" ")}
              sideOffset={2}
              alignOffset={-4}
              collisionPadding={8}
            >
              {renderItems(item.items, className)}
            </RadixContextMenu.SubContent>
          </RadixContextMenu.Portal>
        </RadixContextMenu.Sub>
      );
    }
    if (item.checked !== undefined) {
      return (
        <RadixContextMenu.CheckboxItem
          key={key}
          className={itemClass(item)}
          checked={item.checked}
          disabled={item.disabled}
          onSelect={item.onSelect}
          aria-keyshortcuts={item.shortcut}
        >
          <Body
            item={item}
            trailing={
              <RadixContextMenu.ItemIndicator className={menu.check}>
                <CheckIcon />
              </RadixContextMenu.ItemIndicator>
            }
          />
        </RadixContextMenu.CheckboxItem>
      );
    }
    return (
      <RadixContextMenu.Item
        key={key}
        className={itemClass(item)}
        disabled={item.disabled}
        onSelect={item.onSelect}
        aria-keyshortcuts={item.shortcut}
      >
        <Body item={item} />
      </RadixContextMenu.Item>
    );
  });
}

/**
 * 우클릭 메뉴(Radix ContextMenu). 지라·리니어의 목록 행 우클릭처럼 항목·하위 메뉴·체크·단축키 힌트·위험 항목을 지원한다.
 * 시각은 Dropdown과 같다. 커서 위치에서 열리고 화면 가장자리에서는 8px 띄워 뒤집힌다.
 */
export function ContextMenu({ children, items, className, disabled, onOpenChange }: ContextMenuProps) {
  return (
    <RadixContextMenu.Root onOpenChange={onOpenChange}>
      <RadixContextMenu.Trigger asChild disabled={disabled}>
        {children}
      </RadixContextMenu.Trigger>
      <RadixContextMenu.Portal>
        <RadixContextMenu.Content
          className={[menu.content, styles.content, className].filter(Boolean).join(" ")}
          collisionPadding={8}
        >
          {renderItems(items, className)}
        </RadixContextMenu.Content>
      </RadixContextMenu.Portal>
    </RadixContextMenu.Root>
  );
}

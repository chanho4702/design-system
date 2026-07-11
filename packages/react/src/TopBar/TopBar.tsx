import type { ReactNode } from "react";
import { useId } from "react";
import styles from "./TopBar.module.css";

export interface TopBarProps {
  /** 로고/제품명 영역. */
  brand: ReactNode;
  /** 전역 검색 콜백. 지정하면 검색 인풋이 렌더링된다. */
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  /** 우측 액션 (버튼, 아바타 등). */
  actions?: ReactNode;
}

/**
 * 상단 고정 헤더. brand, 선택적 전역 검색, 우측 actions 슬롯으로 구성된다.
 */
export function TopBar({ brand, onSearch, searchPlaceholder = "검색", actions }: TopBarProps) {
  const searchId = useId();

  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>{brand}</div>
      {onSearch ? (
        <div className={styles.search}>
          <label className={styles.searchLabel} htmlFor={searchId}>
            전역 검색
          </label>
          <input
            id={searchId}
            className={styles.searchInput}
            type="search"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      ) : null}
      <div className={styles.actions}>{actions}</div>
    </header>
  );
}

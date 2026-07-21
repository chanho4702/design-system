import type { ReactNode } from "react";
import { useId } from "react";
import styles from "./TopBar.module.css";

export interface TopBarProps {
  /** 로고/제품명 영역. */
  brand: ReactNode;
  /** 전역 검색 콜백. 지정하면 중앙에 검색 인풋이 렌더링된다. */
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  /** 검색 인풋 오른쪽(중앙 영역)에 붙는 요소 — 예: "만들기" 버튼. onSearch 없이도 렌더된다. */
  searchTrailing?: ReactNode;
  /** 우측 액션 (버튼, 아바타 등). */
  actions?: ReactNode;
}

/**
 * 상단 고정 헤더. 3열 배치(brand | 중앙 검색+trailing | 우측 actions)로,
 * 중앙 영역이 헤더 정중앙에 오도록 좌/우 열을 동일 flex로 둔다.
 */
export function TopBar({ brand, onSearch, searchPlaceholder = "검색", searchTrailing, actions }: TopBarProps) {
  const searchId = useId();
  const hasCenter = Boolean(onSearch || searchTrailing);

  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>{brand}</div>
      {hasCenter ? (
        <div className={styles.center}>
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
          {searchTrailing}
        </div>
      ) : null}
      <div className={styles.actions}>{actions}</div>
    </header>
  );
}

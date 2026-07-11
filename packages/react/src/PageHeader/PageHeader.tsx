import type { ComponentPropsWithRef, ReactNode } from "react";
import styles from "./PageHeader.module.css";

export interface BreadcrumbItem {
  label: string;
  /** 링크 주소. 생략하면 현재 위치(비링크)로 렌더된다. */
  href?: string;
}

export interface PageHeaderProps extends Omit<ComponentPropsWithRef<"div">, "title"> {
  /** 상단 브레드크럼 경로. */
  breadcrumbs?: BreadcrumbItem[];
  /** 페이지 제목. h1으로 렌더된다. */
  title: string;
  /** 우측 액션 영역 (버튼 등). */
  actions?: ReactNode;
  /** 하단 슬롯 (Tabs 등). */
  bottom?: ReactNode;
}

/**
 * 페이지 상단 헤더. 브레드크럼, 제목, 우측 액션, 하단 슬롯으로 구성된다.
 */
export function PageHeader({
  breadcrumbs,
  title,
  actions,
  bottom,
  className,
  ...rest
}: PageHeaderProps) {
  return (
    <div className={[styles.pageHeader, className].filter(Boolean).join(" ")} {...rest}>
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav aria-label="현재 위치">
          <ol className={styles.breadcrumbList}>
            {breadcrumbs.map((crumb, i) => (
              <li key={i} className={styles.breadcrumbItem}>
                {crumb.href ? (
                  <a className={styles.breadcrumbLink} href={crumb.href}>
                    {crumb.label}
                  </a>
                ) : (
                  <span className={styles.breadcrumbCurrent} aria-current="page">
                    {crumb.label}
                  </span>
                )}
                {i < breadcrumbs.length - 1 ? (
                  <span className={styles.breadcrumbSep} aria-hidden="true">
                    /
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      <div className={styles.row}>
        <h1 className={styles.title}>{title}</h1>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      {bottom ? <div className={styles.bottom}>{bottom}</div> : null}
    </div>
  );
}

import type { ComponentPropsWithRef, CSSProperties, ReactNode } from "react";
import styles from "./Skeleton.module.css";

/**
 * 스켈레톤 — 콘텐츠가 오기 전 자리를 미리 잡아 두는 회색 블록(Atlassian `@atlaskit/skeleton` 4.4.4 기준).
 * 색은 `--chanho-color-skeleton`, 쉬머는 Atlassian과 같이 `skeleton` ↔ `skeleton-subtle` 배경색을
 * 1.5s 선형으로 왕복한다. `prefers-reduced-motion: reduce`면 멈춘다.
 *
 * 접근성: 블록 자체는 장식이라 기본적으로 스크린리더에서 감춘다(`aria-hidden`).
 * 로딩 영역 하나에 한 번 `label`을 주면 `role="status"`와 시각적으로 숨긴 문구로 "불러오는 중"을 알린다.
 */

type Size = number | string;

const RADIUS = {
  small: "var(--chanho-radius-small)",
  medium: "var(--chanho-radius-medium)",
  large: "var(--chanho-radius-large)",
  full: "var(--chanho-radius-full)",
} as const;

function cssSize(value: Size | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

/** label이 있으면 status 래퍼로, 없으면 장식(aria-hidden)으로 감싼다. */
function a11yProps(label: string | undefined) {
  return label ? { role: "status" as const } : { "aria-hidden": true as const };
}

function HiddenLabel({ label }: { label?: string }) {
  return label ? <span className={styles.visuallyHidden}>{label}</span> : null;
}

export interface SkeletonProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  /**
   * 모양. text는 본문 한 줄(높이 12px), circle은 원형(아바타·아이콘 자리), rect는 임의 블록.
   * @default 'rect'
   */
  variant?: "rect" | "text" | "circle";
  /** 너비(px 숫자 또는 CSS 값). 기본: rect·text는 100%, circle은 32px. */
  width?: Size;
  /** 높이(px 숫자 또는 CSS 값). 기본: rect 16px, text 12px, circle은 너비와 같다. */
  height?: Size;
  /**
   * 모서리 반경. 토큰 이름 또는 CSS 값. 기본: circle은 full, 나머지는 small(4px — Atlassian 기본).
   */
  radius?: keyof typeof RADIUS | string;
  /**
   * 쉬머(밝기 왕복) 애니메이션. 움직임 줄이기 설정이면 켜도 멈춘다.
   * @default true
   */
  shimmer?: boolean;
  /** 스크린리더에 알릴 로딩 문구. 주면 `role="status"`가 되고, 안 주면 장식으로 감춘다. */
  label?: string;
}

export function Skeleton({
  variant = "rect",
  width,
  height,
  radius,
  shimmer = true,
  label,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const w = cssSize(width) ?? (variant === "circle" ? "32px" : undefined);
  const h = cssSize(height) ?? (variant === "circle" ? w : undefined);
  const r = radius ? (RADIUS[radius as keyof typeof RADIUS] ?? radius) : undefined;
  const merged: CSSProperties = { width: w, height: h, borderRadius: r, ...style };
  const cls = [
    styles.skeleton,
    styles[variant],
    shimmer ? styles.shimmer : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={cls} style={merged} {...a11yProps(label)} {...rest}>
      <HiddenLabel label={label} />
    </span>
  );
}

export interface SkeletonTextProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  /**
   * 줄 수.
   * @default 3
   */
  lines?: number;
  /**
   * 마지막 줄 너비 — 문단 끝이 짧게 끝나는 모양. 한 줄일 때는 무시된다.
   * @default '60%'
   */
  lastLineWidth?: Size;
  /** 전체 너비. @default '100%' */
  width?: Size;
  /** @default true */
  shimmer?: boolean;
  /** 로딩 문구(있으면 `role="status"`). */
  label?: string;
}

/** 본문 문단 자리 — 줄 간격은 본문 행간(22px)에 맞춘다. */
export function SkeletonText({
  lines = 3,
  lastLineWidth = "60%",
  width,
  shimmer = true,
  label,
  className,
  style,
  ...rest
}: SkeletonTextProps) {
  const count = Math.max(1, Math.floor(lines));
  return (
    <span
      className={[styles.textGroup, className].filter(Boolean).join(" ")}
      style={{ width: cssSize(width), ...style }}
      {...a11yProps(label)}
      {...rest}
    >
      <HiddenLabel label={label} />
      {Array.from({ length: count }, (_, i) => (
        <Skeleton
          key={i}
          variant="text"
          shimmer={shimmer}
          width={count > 1 && i === count - 1 ? lastLineWidth : undefined}
        />
      ))}
    </span>
  );
}

const AVATAR_SIZE = { small: 24, medium: 32, large: 40 } as const;

export interface SkeletonAvatarProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  /**
   * Avatar와 같은 크기(24/32/40px).
   * @default 'medium'
   */
  size?: keyof typeof AVATAR_SIZE;
  /** @default true */
  shimmer?: boolean;
  label?: string;
}

/** Avatar 자리(원형) — `@atlaskit/avatar` skeleton과 같이 원 하나. */
export function SkeletonAvatar({ size = "medium", ...rest }: SkeletonAvatarProps) {
  return <Skeleton variant="circle" width={AVATAR_SIZE[size]} {...rest} />;
}

export interface SkeletonListItemProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  /**
   * 앞머리 모양 — 아바타(원)·아이콘(둥근 사각)·없음. `@atlaskit/menu` SkeletonItem의 hasAvatar/hasIcon.
   * @default 'none'
   */
  media?: "avatar" | "icon" | "none";
  /**
   * 글줄 수(제목 + 설명). 2면 두 번째 줄이 짧고 옅다.
   * @default 1
   */
  lines?: 1 | 2;
  /** 첫 줄 너비. @default '60%' */
  width?: Size;
  /** @default true */
  shimmer?: boolean;
  label?: string;
  /** 오른쪽 끝에 붙일 요소(배지 자리 등). */
  trailing?: ReactNode;
}

/** 목록·메뉴·사이드바 한 줄 자리(높이 40px). */
export function SkeletonListItem({
  media = "none",
  lines = 1,
  width = "60%",
  shimmer = true,
  label,
  trailing,
  className,
  ...rest
}: SkeletonListItemProps) {
  return (
    <span
      className={[styles.listItem, lines === 2 ? styles.listItemTall : null, className].filter(Boolean).join(" ")}
      {...a11yProps(label)}
      {...rest}
    >
      <HiddenLabel label={label} />
      {media === "avatar" ? <Skeleton variant="circle" width={24} shimmer={shimmer} /> : null}
      {media === "icon" ? <Skeleton width={20} height={20} radius="small" shimmer={shimmer} /> : null}
      <span className={styles.listText}>
        <Skeleton variant="text" height={9} radius="full" width={width} shimmer={shimmer} />
        {lines === 2 ? <Skeleton variant="text" height={7} radius="full" width="40%" shimmer={shimmer} /> : null}
      </span>
      {trailing}
    </span>
  );
}

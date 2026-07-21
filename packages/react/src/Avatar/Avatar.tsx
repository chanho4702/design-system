import type { ComponentPropsWithRef } from "react";
import styles from "./Avatar.module.css";

/** 이니셜 배경 틴트. auto는 name 해시로 이 중 하나를 결정론적으로 고른다. */
export type AvatarColor = "neutral" | "blue" | "green" | "orange" | "red" | "teal" | "auto";

export interface AvatarProps extends ComponentPropsWithRef<"span"> {
  /** 사용자 이름. 이미지 alt와 이니셜 생성에 사용한다. */
  name: string;
  /** 프로필 이미지 URL. 없으면 이니셜을 표시한다. */
  src?: string;
  /**
   * 크기(24/32/40px). 밀도 높은 목록에는 small을 사용한다.
   * @default 'medium'
   */
  size?: "small" | "medium" | "large";
  /**
   * 이니셜 배경색. 'auto'는 name 기반 결정론적 틴트(같은 이름 → 항상 같은 색).
   * @default 'neutral'
   */
  color?: AvatarColor;
}

const TINTS = ["blue", "green", "orange", "red", "teal"] as const;

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/** name을 안정적인 인덱스로 해시해 틴트를 고른다. 렌더 간·세션 간 결정론적. */
function tintOf(name: string): (typeof TINTS)[number] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return TINTS[hash % TINTS.length];
}

export function Avatar({ name, src, size = "medium", color = "neutral", className, ...rest }: AvatarProps) {
  const resolved = color === "auto" ? tintOf(name) : color;
  const cls = [
    styles.avatar,
    styles[size],
    resolved !== "neutral" && styles[resolved],
    className,
  ]
    .filter(Boolean)
    .join(" ");
  if (src) {
    return (
      <span className={cls} {...rest}>
        <img className={styles.image} src={src} alt={name} />
      </span>
    );
  }
  return (
    <span role="img" aria-label={name} className={cls} {...rest}>
      {initialsOf(name)}
    </span>
  );
}

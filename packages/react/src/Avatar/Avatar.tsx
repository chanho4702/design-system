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

/** 한글·한자·가나 — 한 글자 폭이 라틴 대문자의 1.5배쯤이라 24px 원에 두 글자가 들어가지 않는다. */
const WIDE_SCRIPT = /[\u1100-\u11FF\u3040-\u30FF\u3130-\u318F\u3400-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF]/;

function initialsOf(name: string, size: "small" | "medium" | "large"): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = Array.from(words[0])[0];
  if (words.length === 1) return first.toUpperCase();
  const initials = (first + Array.from(words[words.length - 1])[0]).toUpperCase();
  // small(24px)에 한글 두 글자("개위")를 넣으면 원 밖으로 넘친다 — 첫 글자 하나만.
  return size === "small" && WIDE_SCRIPT.test(initials) ? first.toUpperCase() : initials;
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
      {initialsOf(name, size)}
    </span>
  );
}

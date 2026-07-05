import type { ComponentPropsWithRef } from "react";
import styles from "./Avatar.module.css";

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
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function Avatar({ name, src, size = "medium", className, ...rest }: AvatarProps) {
  const cls = [styles.avatar, styles[size], className].filter(Boolean).join(" ");
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

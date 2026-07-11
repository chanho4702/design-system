import type { ReactNode } from "react";
import styles from "./Comment.module.css";

export interface CommentAction {
  label: string;
  onClick: () => void;
  /** 삭제 등 파괴적 액션. 호버 시 위험 색으로 강조된다. */
  danger?: boolean;
}

export interface CommentProps {
  author: string;
  /** Avatar 컴포넌트 등 작성자 시각 표현. */
  avatar: ReactNode;
  /** "3시간 전" 등 상대 시각. */
  time: string;
  children: ReactNode;
  /** 답글/편집/삭제 등 하단 액션. */
  actions?: CommentAction[];
  /** 대댓글 들여쓰기. */
  nested?: boolean;
}

/**
 * 작성자·시각·본문·액션으로 구성된 댓글 블록. nested로 대댓글 들여쓰기를 표현한다.
 */
export function Comment({ author, avatar, time, children, actions, nested = false }: CommentProps) {
  return (
    <div className={[styles.comment, nested ? styles.nested : null].filter(Boolean).join(" ")}>
      <div className={styles.avatar}>{avatar}</div>
      <div className={styles.main}>
        <div className={styles.meta}>
          <span className={styles.author}>{author}</span>
          <span className={styles.time}>{time}</span>
        </div>
        <div className={styles.body}>{children}</div>
        {actions && actions.length > 0 ? (
          <div className={styles.actions}>
            {actions.map((a) => (
              <button
                key={a.label}
                type="button"
                className={[styles.action, a.danger ? styles.danger : null]
                  .filter(Boolean)
                  .join(" ")}
                onClick={a.onClick}
              >
                {a.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

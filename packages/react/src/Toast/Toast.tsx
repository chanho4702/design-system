import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Toast as RadixToast } from "radix-ui";
import styles from "./Toast.module.css";

export interface ToastOptions {
  title: string;
  description?: string;
  /**
   * 시각적 의미. 좌측 색 띠로 표시된다.
   * @default 'info'
   */
  appearance?: "info" | "success" | "danger";
  /**
   * 동작 버튼 하나(선택) — "되돌리기"·"보기" 같은 후속 동작. 누르면 onClick을 부르고 토스트를 닫는다.
   * 설명 아래 링크 모양으로 놓인다(Atlassian Flag actions).
   */
  action?: ToastAction;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
  /**
   * 스크린리더에 알리는 대안 안내 — 토스트는 곧 사라지므로 같은 일을 할 다른 길을 적는다
   * (예: "휴지통에서 복원할 수 있습니다"). 비우면 label을 쓴다. Radix Toast.Action의 altText.
   */
  altText?: string;
}

type ToastEntry = ToastOptions & { id: number };

const ToastContext = createContext<((options: ToastOptions) => void) | null>(null);

/** toast({ title, description?, appearance?, action? })를 반환한다. ToastProvider 안에서만 사용 가능. */
export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) {
    throw new Error("useToast는 ToastProvider 안에서만 사용할 수 있다");
  }
  return toast;
}

function XIcon() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true">
      <path
        d="M3 3l6 6M9 3l-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface ToastProviderProps {
  children: ReactNode;
  /**
   * 자동 사라짐까지의 시간(ms).
   * @default 5000
   */
  duration?: number;
}

/** 앱 루트에 한 번 감싼다. 토스트는 우하단에 쌓인다. */
export function ToastProvider({ children, duration = 5000 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const counter = useRef(0);

  const toast = useCallback((options: ToastOptions) => {
    counter.current += 1;
    setToasts((prev) => [...prev, { ...options, id: counter.current }]);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      <RadixToast.Provider swipeDirection="right" duration={duration}>
        {children}
        {toasts.map((entry) => (
          <RadixToast.Root
            key={entry.id}
            type="background"
            className={styles.toast}
            data-appearance={entry.appearance ?? "info"}
            onOpenChange={(open) => {
              if (!open) remove(entry.id);
            }}
          >
            <div className={styles.body}>
              <RadixToast.Title className={styles.title}>{entry.title}</RadixToast.Title>
              {entry.description ? (
                <RadixToast.Description className={styles.description}>
                  {entry.description}
                </RadixToast.Description>
              ) : null}
              {entry.action ? (
                <div className={styles.actions}>
                  <RadixToast.Action asChild altText={entry.action.altText ?? entry.action.label}>
                    <button type="button" className={styles.action} onClick={entry.action.onClick}>
                      {entry.action.label}
                    </button>
                  </RadixToast.Action>
                </div>
              ) : null}
            </div>
            <RadixToast.Close asChild>
              <button type="button" className={styles.close} aria-label="닫기">
                <XIcon />
              </button>
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className={styles.viewport} label="알림 ({hotkey})" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

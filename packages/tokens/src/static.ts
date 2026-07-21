/** 테마와 무관한 정적 토큰. 4px 그리드 (25 = 2px 반스텝). */
export const space = {
  0: "0",
  25: "2px",
  50: "4px",
  75: "6px",
  100: "8px",
  150: "12px",
  200: "16px",
  250: "20px",
  300: "24px",
  400: "32px",
  500: "40px",
  600: "48px",
  800: "64px",
  1000: "80px",
} as const;

export const radius = {
  small: "4px",
  medium: "6px",
  large: "12px",
  xlarge: "16px",
  full: "9999px",
} as const;

/**
 * 트랜지션 — 인터랙션 상태 전환. CSS에서 `transition: <prop> var(--chanho-transition-base)` 형태로 사용.
 * 기본값은 150ms ease (Atlassian 감속감).
 */
export const transition = {
  fast: "100ms ease",
  base: "150ms ease",
  slow: "250ms ease",
} as const;

export const font = {
  family: {
    sans: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, 'SF Mono', Consolas, monospace",
  },
  /** size/lineHeight는 항상 같은 번호끼리 페어로 사용한다 (한글 기준 행간 여유). */
  size: {
    50: "11px",
    75: "12px",
    100: "14px",
    200: "16px",
    300: "20px",
    400: "24px",
    500: "28px",
    600: "32px",
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    50: "16px",
    75: "18px",
    100: "22px",
    200: "24px",
    300: "28px",
    400: "32px",
    500: "36px",
    600: "40px",
  },
} as const;

export const z = {
  navigation: "200",
  dropdown: "400",
  blanket: "500",
  modal: "510",
  toast: "600",
  tooltip: "700",
} as const;

/** 포커스 링 — 배경과 무관하게 항상 보이는 2중 링. 시맨틱 변수를 참조하므로 테마 자동 대응. */
export const focus = {
  ring: "0 0 0 2px var(--chanho-color-background-default), 0 0 0 4px var(--chanho-color-border-focused)",
} as const;

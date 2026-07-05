/** 테마와 무관한 정적 토큰. 8px 기반 스케일. */
export const space = {
  0: "0",
  25: "2px",
  50: "4px",
  100: "8px",
  150: "12px",
  200: "16px",
  300: "24px",
  400: "32px",
  500: "40px",
  600: "48px",
} as const;

export const radius = {
  small: "3px",
  medium: "6px",
  large: "12px",
  full: "9999px",
} as const;

export const font = {
  family: {
    sans: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
  },
  size: {
    100: "12px",
    200: "14px",
    300: "16px",
    400: "20px",
    500: "24px",
    600: "29px",
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    100: "16px",
    200: "20px",
    300: "24px",
    400: "28px",
    500: "32px",
    600: "36px",
  },
} as const;

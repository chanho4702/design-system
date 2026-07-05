import { palette } from "./palette";

/**
 * 시맨틱 컬러 토큰. 컴포넌트는 이 키에서 생성된 CSS 변수만 사용한다.
 * light와 dark는 반드시 동일한 키 세트를 가진다 (buildCss.test.ts에서 강제).
 */
export const themes = {
  light: {
    "color.background.default": palette.gray[0],
    "color.background.surface": palette.gray[0],
    "color.background.subtle": palette.gray[50],
    "color.background.brand": palette.blue[500],
    "color.background.brand-hovered": palette.blue[600],
    "color.background.brand-pressed": palette.blue[700],
    "color.background.neutral": palette.gray[100],
    "color.background.neutral-hovered": palette.gray[200],
    "color.background.danger": palette.red[600],
    "color.background.danger-hovered": palette.red[700],
    "color.text.default": palette.gray[900],
    "color.text.subtle": palette.gray[600],
    "color.text.inverse": palette.gray[0],
    "color.text.brand": palette.blue[600],
    "color.border.default": palette.gray[200],
    "color.border.focused": palette.blue[500],
  },
  dark: {
    "color.background.default": palette.gray[1000],
    "color.background.surface": palette.gray[900],
    "color.background.subtle": palette.gray[800],
    "color.background.brand": palette.blue[400],
    "color.background.brand-hovered": palette.blue[300],
    "color.background.brand-pressed": palette.blue[200],
    "color.background.neutral": palette.gray[800],
    "color.background.neutral-hovered": palette.gray[700],
    "color.background.danger": palette.red[500],
    "color.background.danger-hovered": palette.red[400],
    "color.text.default": palette.gray[50],
    "color.text.subtle": palette.gray[400],
    "color.text.inverse": palette.gray[1000],
    "color.text.brand": palette.blue[300],
    "color.border.default": palette.gray[700],
    "color.border.focused": palette.blue[400],
  },
} as const;

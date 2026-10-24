/**
 * 원시 컬러 토큰. 컴포넌트에서 직접 참조 금지 — 시맨틱 토큰(semantic.ts)을 통해서만 사용한다.
 *
 * 값의 출처: Atlassian이 현재 배포 중인 팔레트(`@atlaskit/tokens` 20.7.0
 * `artifacts/palettes-raw/palette-brand-refresh.js`, 테마 `artifacts/themes/atlassian-{light,dark}.js`).
 * 소비 앱이 키 이름에 의존하지 않도록 시맨틱 토큰만 쓰게 하고 있지만, 키 세트는 0.4.0과 같게 유지하고
 * 필요한 단계만 덧붙였다. 주석의 `Blue700`·`Neutral1000` 등은 Atlassian 팔레트 이름이다.
 *
 * 알파 값(뉴트럴 틴트·테두리)은 시맨틱 토큰에 직접 적는다 — 어느 표면 위에 올려도 같은 단계 차이를
 * 내도록 Atlassian이 알파로 정의한 값이라, 불투명 근사로 바꾸면 다크 오버레이 위에서 틴트가 사라진다.
 */
export const palette = {
  /** 브랜드 블루 — primary 500 = Blue700 #1868DB(brand-bold). */
  blue: {
    50: "#E9F2FE", // Blue100 — brand-subtlest, selected
    100: "#CFE1FD", // Blue200 — subtlest-hovered
    150: "#ADCBFB", // Blue250 — subtlest-pressed, 다크 brand-pressed
    200: "#8FB8F6", // Blue300 — 다크 brand-hovered·focus·link-pressed
    300: "#669DF1", // Blue400 — 다크 brand-bold
    400: "#4688EC", // Blue500 — 라이트 border-focused
    450: "#357DE8", // Blue600 — border-information
    500: "#1868DB", // Blue700 — brand-bold
    600: "#1558BC", // Blue800 — brand-bold-hovered, text-information
    700: "#144794", // Blue850 — brand-bold-pressed
    800: "#123263", // Blue900 — 다크 subtlest-hovered, text-information-bolder
    900: "#1C2B42", // Blue1000 — 다크 brand-subtlest, selected
  },
  /** 라이트 뉴트럴 — 푸른 기를 뺀 현행 그레이(text 900 #292A2E, subtle 700 #505258, sunken 50 #F8F8F8). */
  gray: {
    0: "#FFFFFF", // Neutral0
    50: "#F8F8F8", // Neutral100 — surface-sunken, input-hovered
    100: "#F0F1F2", // Neutral200
    200: "#DDDEE1", // Neutral300
    300: "#B7B9BE", // Neutral400 — border-accent-gray-subtle
    400: "#8C8F97", // Neutral500 — border-input
    500: "#7D818A", // Neutral600 — border-bold
    600: "#6B6E76", // Neutral700 — text-subtlest
    700: "#505258", // Neutral800 — text-subtle
    800: "#3B3D42", // Neutral900 — neutral-bold-hovered
    900: "#292A2E", // Neutral1000 — text, neutral-bold
    1000: "#1E1F21", // Neutral1100
  },
  /** 다크 테마 전용 램프 — 낮은 번호 = 깊은 배경(sunken 0 #18191A, surface 100 #1F1F21), 높은 번호 = 밝은 텍스트. */
  darkGray: {
    0: "#18191A", // surface-sunken
    100: "#1F1F21", // DarkNeutral100 — surface
    200: "#242528", // DarkNeutral200 — surface-raised, input
    250: "#2B2C2F", // DarkNeutral250 — surface-overlay, input-hovered
    300: "#303134", // DarkNeutral300
    350: "#3D3F43", // DarkNeutral350
    400: "#4B4D51", // DarkNeutral400 — border-accent-gray-subtle
    500: "#63666B", // DarkNeutral500
    600: "#7E8188", // DarkNeutral600 — border-input, border-bold
    700: "#96999E", // DarkNeutral700 — text-subtlest
    800: "#A9ABAF", // DarkNeutral800 — text-subtle
    900: "#BFC1C4", // DarkNeutral900 — neutral-bold-hovered
    1000: "#CECFD2", // DarkNeutral1000 — text, neutral-bold
    1100: "#E2E3E4", // DarkNeutral1100
  },
  red: {
    50: "#FFECEB", // Red100 — background-danger
    100: "#FFD5D2", // Red200 — danger-subtler
    200: "#FFB8B2", // Red250
    300: "#FD9891", // Red300
    400: "#F87168", // Red400 — 다크 danger-bold
    450: "#F15B50", // Red500 — 다크 border-danger
    480: "#E2483D", // Red600 — 라이트 border-danger
    500: "#C9372C", // Red700 — danger-bold
    600: "#AE2E24", // Red800 — danger-bold-hovered, text-danger
    700: "#872821", // Red850 — danger-bold-pressed
    800: "#5D1F1A", // Red900 — text-danger-bolder
    900: "#42221F", // Red1000 — 다크 background-danger
  },
  /** 성공 = Atlassian Lime 계열(현행 success 토큰은 Lime을 쓴다). */
  green: {
    50: "#EFFFD6", // Lime100 — background-success
    100: "#D3F1A7", // Lime200 — success-subtler
    300: "#B3DF72", // Lime300 — 다크 text-success
    400: "#94C748", // Lime400 — 다크 success-bold
    450: "#82B536", // Lime500
    500: "#5B7F24", // Lime700 — success-bold
    600: "#4C6B1F", // Lime800 — success-bold-hovered, text-success
    700: "#3F5224", // success-bold-pressed
    800: "#37471F", // Lime900 — text-success-bolder
    900: "#28311B", // Lime1000 — 다크 background-success
  },
  /** 경고 = Atlassian Orange 계열(현행 warning-bold #FBC828은 Orange300). */
  orange: {
    50: "#FFF5DB", // Orange100 — background-warning
    100: "#FCE4A6", // Orange200 — warning-subtler
    300: "#FBC828", // Orange300 — warning-bold
    400: "#FCA700", // Orange400 — warning-bold-hovered
    450: "#F68909", // Orange500 — warning-bold-pressed
    480: "#E06C00", // Orange600 — border-warning
    500: "#9E4C00", // Orange800 — text-warning
    600: "#7A3B00", // 다크 warning-pressed
    700: "#693200", // Orange900 — text-warning-bolder
    900: "#3A2C1F", // Orange1000 — 다크 background-warning
  },
  /** 청록 — 현행 시맨틱에서는 쓰지 않는다(정보색은 Atlassian처럼 블루). 액센트용으로 남긴다. */
  teal: {
    100: "#E7F9FF", // Teal100
    300: "#9DD9EE", // Teal300
    400: "#6CC3E0", // Teal400
    500: "#227D9B", // Teal700
    600: "#206A83", // Teal800
    700: "#164555", // Teal900
    900: "#1E3137", // Teal1000
  },
} as const;

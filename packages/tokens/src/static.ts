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

/**
 * 반경 — Atlassian 현행 shape 스케일(`@atlaskit/tokens` 20.7.0 `atlassian-shape.js`).
 * 버튼·입력·탭·사이드바 항목 = medium(6px), 작은(24px) 버튼·로젠지·태그 = small(4px),
 * 팝업·플래그·섹션 메시지 = large(8px), 모달 = xlarge(12px).
 * 0.4.0 대비 large 12→8, xlarge 16→12로 바뀌었다(이전 값은 xlarge·xxlarge로 옮겨 감).
 */
export const radius = {
  xsmall: "2px",
  small: "4px",
  medium: "6px",
  large: "8px",
  xlarge: "12px",
  xxlarge: "16px",
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

/**
 * 모션 — 오버레이 등장·퇴장, 위치·크기 전환. `transition.*`(상태 색 전환 단축형)은 그대로 두고 그 위에 얹는다.
 *
 * - 지속시간: 25ms 격자(`@atlaskit/motion` 9.4.0 `durationStep = 25`) 위에서 리니어처럼 짧게 —
 *   Atlassian `durations.small` 100ms가 fast, 퇴장은 등장의 절반 안팎(`EXITING_MOTION_MULTIPLIER = 0.5`).
 *   instant 50(툴팁 퇴장·미세 피드백) / fast 100(메뉴 퇴장·hover) / base 150(메뉴·팝오버 등장) /
 *   moderate 200(모달·토스트 등장, 밑줄 이동) / slow 300(큰 면 이동 — 드물게).
 * - 이징: `@atlaskit/motion` `utils/curves.js` 값 그대로.
 *   standard = easeIn40Out(이미 화면에 있는 것이 움직일 때 — 탭 밑줄·사이드바 폭),
 *   enter = easeOut(빠르게 나타나 감속 — 등장), exit = easeIn(가속하며 사라짐 — 퇴장).
 * - 움직임 줄이기(`prefers-reduced-motion: reduce`)면 tokens.css가 지속시간을 전부 1ms로 덮는다(`reducedMotion`).
 *   0이 아니라 1ms인 이유: 애니메이션 이름은 그대로라 Radix Presence가 animationend를 기다리는데, 1ms면
 *   이벤트가 확실히 와서 퇴장 중인 오버레이가 남지 않는다.
 */
export const motion = {
  duration: {
    instant: "50ms",
    fast: "100ms",
    base: "150ms",
    moderate: "200ms",
    slow: "300ms",
  },
  easing: {
    standard: "cubic-bezier(0.4, 0, 0, 1)",
    enter: "cubic-bezier(0.2, 0, 0, 1)",
    exit: "cubic-bezier(0.8, 0, 0, 0.8)",
  },
} as const;

/** 움직임 줄이기에서 덮어쓸 값 — 모든 `motion.duration.*`를 1ms로. 이징은 그대로 둔다. */
export const reducedMotion = {
  motion: {
    duration: Object.fromEntries(Object.keys(motion.duration).map((k) => [k, "1ms"])) as Record<
      keyof typeof motion.duration,
      string
    >,
  },
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
  /**
   * Atlassian 현행 굵기(`--ds-font-weight-*`): bold는 653(헤딩·로젠지·폼 라벨).
   * Pretendard Variable은 wght 축(45–920)이라 653을 그대로 그린다. 정적 Pretendard로 떨어지면
   * 브라우저가 가장 가까운 700을 고른다.
   */
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "653",
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
  /** 팝오버(Select·Dropdown 메뉴·InlineEdit 액션) — 모달 안에서 열려도 블랭킷·모달 위에 떠야 한다 */
  popover: "550",
  toast: "600",
  tooltip: "700",
} as const;

/** 포커스 링 — 배경과 무관하게 항상 보이는 2중 링. 시맨틱 변수를 참조하므로 테마 자동 대응. */
export const focus = {
  ring: "0 0 0 2px var(--chanho-color-background-default), 0 0 0 4px var(--chanho-color-border-focused)",
} as const;

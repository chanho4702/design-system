/**
 * 호스트 마운트 경로 계산. `basePath`는 호스트마다 다르고(wiki `/admin/org`,
 * ALM `/settings/org`) 앞 슬래시 누락·뒤 슬래시가 섞여 온다 — 경로를 만드는 곳이
 * 두 군데 이상이므로 규칙을 여기 한 곳에 둔다.
 */

/** 마운트 경로를 절대 경로 앞머리로 정규화한다(앞 슬래시 보충·뒤 슬래시 제거). */
export function normalizeBasePath(basePath: string): string {
  const trimmed = basePath.trim().replace(/\/+$/, "");
  if (trimmed === "") return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

/** 메일 설정 화면 경로 — 발송 로그가 이 화면 아래에 있다. */
export function mailPath(basePath: string): string {
  return `${normalizeBasePath(basePath)}/mail`;
}

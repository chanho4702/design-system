/**
 * Blob을 파일로 내려받게 한다 — 임시 객체 URL을 만든 a[download]를 눌렀다가 바로 치운다.
 * 인증 fetch로 받은 응답이라 서버 URL을 그대로 링크로 걸 수 없다(토큰이 헤더에 있다).
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove();
    // 클릭 직후 해제하면 일부 브라우저가 다운로드를 시작하기 전에 URL이 사라진다 — 한 틱 미룬다.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

/** 오늘 날짜(로컬) `YYYY-MM-DD` — 내려받은 파일 이름이 겹치지 않게 붙인다. */
export function todayStamp(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

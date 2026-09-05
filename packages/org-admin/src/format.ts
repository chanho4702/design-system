import type {
  GrantRole,
  GrantScope,
  InvitationStatus,
  JoinedVia,
  MemberKind,
  MemberStatus,
  TeamRole,
} from "./api/types";

/**
 * 날짜 표시. 백엔드가 값을 안 주거나 파싱이 안 되면 "-"를 돌려준다 —
 * 화면에 Invalid Date가 새어 나오지 않게 하는 것이 이 함수의 목적이다.
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${formatDate(value)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const MEMBER_STATUS_LABEL: Record<MemberStatus, string> = {
  PENDING: "승인 대기",
  ACTIVE: "활성",
  SUSPENDED: "일시 정지",
  DEACTIVATED: "비활성",
};

export const MEMBER_KIND_LABEL: Record<MemberKind, string> = {
  HUMAN: "사람",
  AGENT: "에이전트",
};

export const JOINED_VIA_LABEL: Record<JoinedVia, string> = {
  INVITE: "초대 수락",
  APPROVAL: "관리자 승인",
  BOOTSTRAP: "초기 관리자",
  LEGACY: "기존 계정",
};

export const INVITATION_STATUS_LABEL: Record<InvitationStatus, string> = {
  PENDING: "대기",
  ACCEPTED: "수락",
  EXPIRED: "만료",
  REVOKED: "철회",
};

export const GRANT_SCOPE_LABEL: Record<GrantScope, string> = {
  GLOBAL: "전역",
  SPACE: "스페이스",
  PROJECT: "프로젝트",
};

export const GRANT_ROLE_LABEL: Record<GrantRole, string> = {
  VIEWER: "읽기",
  EDITOR: "편집",
  ADMIN: "관리자",
};

export const TEAM_ROLE_LABEL: Record<TeamRole, string> = {
  LEAD: "리더",
  MEMBER: "팀원",
};

export const MEMBER_EVENT_LABEL: Record<string, string> = {
  INVITED: "초대됨",
  JOINED: "가입",
  APPROVED: "승인됨",
  SUSPENDED: "일시 정지",
  REACTIVATED: "재활성",
  DEACTIVATED: "비활성",
  TEAM_ADDED: "팀 추가",
  TEAM_REMOVED: "팀 제거",
  KEYCLOAK_DISABLED_FAILED: "Keycloak 비활성 실패",
};

export function memberEventLabel(type: string): string {
  return MEMBER_EVENT_LABEL[type] ?? type;
}

/** 붙여넣은 덩어리에서 이메일 후보를 분리한다 — 쉼표·세미콜론·줄바꿈·공백 모두 구분자. */
export function splitEmails(input: string): string[] {
  return input
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter((s) => s !== "");
}

/** 서버가 최종 판정을 하므로 화면 검증은 명백히 틀린 것만 거른다. */
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

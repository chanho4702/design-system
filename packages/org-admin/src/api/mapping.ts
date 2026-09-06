/**
 * 백엔드 응답 → 화면 타입.
 *
 * 계약이 굳기 전이라 **한 파일에 모아** 둔다. 백엔드가 필드 이름을 바꾸면 여기만 고친다.
 * 없는 필드는 삼키지 않고 null로 두고, 화면이 "-"로 대체한다(Invalid Date·undefined 방지).
 *
 * 알려진 이견(설계 §3.3 vs 현행 org-service):
 * - grant의 스코프 키가 스펙은 `scope`, 현행 구현은 `resourceType`이다 → 읽을 때 둘 다 받는다.
 * - 목록이 스펙은 `{items,page,size,total}`, 현행 일부는 배열이다 → `toPage`가 둘 다 받는다.
 */
import type {
  Grant,
  GrantPreset,
  GrantRole,
  GrantScope,
  Invitation,
  InvitationStatus,
  JoinedVia,
  MailLogEntry,
  MailMode,
  MailOutboxStatus,
  MailSetting,
  MailTestResult,
  MailTls,
  Me,
  Member,
  MemberDetail,
  MemberEvent,
  MemberKind,
  MemberStatus,
  MemberTeamRef,
  Page,
  SubjectType,
  Team,
  TeamKind,
  TeamMember,
  TeamPreset,
  TeamRole,
} from "./types";

type Raw = Record<string, unknown>;

function obj(value: unknown): Raw {
  return value && typeof value === "object" ? (value as Raw) : {};
}

function arr(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/** BIGINT id를 문자열로. 0도 유효한 값이라 falsy 검사 대신 null/undefined만 거른다. */
export function str(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  return null;
}

function text(value: unknown, fallback = ""): string {
  return str(value) ?? fallback;
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function bool(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const s = str(value);
  return s && (allowed as readonly string[]).includes(s) ? (s as T) : fallback;
}

function optionalOneOf<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  const s = str(value);
  return s && (allowed as readonly string[]).includes(s) ? (s as T) : null;
}

export const MEMBER_STATUSES = ["PENDING", "ACTIVE", "SUSPENDED", "DEACTIVATED"] as const;
export const MEMBER_KINDS = ["HUMAN", "AGENT"] as const;
export const JOINED_VIAS = ["INVITE", "APPROVAL", "BOOTSTRAP", "LEGACY"] as const;
export const GRANT_SCOPES = ["GLOBAL", "SPACE", "PROJECT"] as const;
export const GRANT_ROLES = ["VIEWER", "EDITOR", "ADMIN"] as const;
export const SUBJECT_TYPES = ["USER", "TEAM"] as const;
export const TEAM_ROLES = ["LEAD", "MEMBER"] as const;
export const TEAM_KINDS = ["STANDARD", "EVERYONE"] as const;
export const INVITATION_STATUSES = ["PENDING", "ACCEPTED", "EXPIRED", "REVOKED"] as const;

/** 배열 응답과 페이지 응답을 모두 받는다. 배열이면 한 페이지로 감싼다. */
export function toPage<T>(raw: unknown, map: (item: unknown) => T, requestedSize: number): Page<T> {
  if (Array.isArray(raw)) {
    const items = raw.map(map);
    return { items, page: 0, size: items.length || requestedSize, total: items.length };
  }
  const body = obj(raw);
  const items = arr(body.items).map(map);
  return {
    items,
    page: num(body.page) ?? 0,
    size: num(body.size) ?? requestedSize,
    total: num(body.total) ?? items.length,
  };
}

export function toMember(raw: unknown): Member {
  const m = obj(raw);
  return {
    id: text(m.id),
    displayName: text(m.displayName, text(m.email, "(이름 없음)")),
    email: str(m.email),
    status: oneOf<MemberStatus>(m.status, MEMBER_STATUSES, "ACTIVE"),
    kind: oneOf<MemberKind>(m.kind, MEMBER_KINDS, "HUMAN"),
    joinedVia: optionalOneOf<JoinedVia>(m.joinedVia, JOINED_VIAS),
    createdAt: str(m.createdAt),
  };
}

export function toMemberTeamRef(raw: unknown): MemberTeamRef {
  const t = obj(raw);
  return {
    id: text(t.id, text(t.teamId)),
    name: text(t.name, "(이름 없는 팀)"),
    role: oneOf<TeamRole>(t.role, TEAM_ROLES, "MEMBER"),
  };
}

export function toGrant(raw: unknown): Grant {
  const g = obj(raw);
  return {
    id: text(g.id),
    subjectType: oneOf<SubjectType>(g.subjectType, SUBJECT_TYPES, "USER"),
    subjectId: text(g.subjectId),
    subjectName: str(g.subjectName) ?? str(g.subjectLabel) ?? str(g.displayName),
    scope: oneOf<GrantScope>(g.scope ?? g.resourceType, GRANT_SCOPES, "GLOBAL"),
    resourceId: str(g.resourceId),
    role: oneOf<GrantRole>(g.role, GRANT_ROLES, "VIEWER"),
  };
}

export function toMemberDetail(raw: unknown): MemberDetail {
  const m = obj(raw);
  return {
    ...toMember(raw),
    teams: arr(m.teams).map(toMemberTeamRef),
    grants: arr(m.grants).map(toGrant),
  };
}

export function toMemberEvent(raw: unknown): MemberEvent {
  const e = obj(raw);
  return {
    id: text(e.id),
    type: text(e.type, "UNKNOWN"),
    actorId: str(e.actorId),
    actorName: str(e.actorName),
    detail: str(e.detail),
    createdAt: str(e.createdAt),
  };
}

export function toTeam(raw: unknown): Team {
  const t = obj(raw);
  return {
    id: text(t.id),
    name: text(t.name, "(이름 없는 팀)"),
    description: str(t.description),
    kind: oneOf<TeamKind>(t.kind, TEAM_KINDS, "STANDARD"),
    memberCount: num(t.memberCount),
    myRole: optionalOneOf<TeamRole>(t.myRole, TEAM_ROLES),
  };
}

export function toTeamMember(raw: unknown): TeamMember {
  const t = obj(raw);
  return {
    id: text(t.memberId, text(t.id)),
    displayName: text(t.displayName, "(이름 없음)"),
    email: str(t.email),
    role: oneOf<TeamRole>(t.role, TEAM_ROLES, "MEMBER"),
  };
}

export function toTeamPreset(raw: unknown): TeamPreset {
  const t = obj(raw);
  return {
    teamId: text(t.teamId, text(t.id)),
    role: oneOf<TeamRole>(t.role, TEAM_ROLES, "MEMBER"),
  };
}

export function toGrantPreset(raw: unknown): GrantPreset {
  const g = obj(raw);
  return {
    scope: oneOf<GrantScope>(g.scope ?? g.resourceType, GRANT_SCOPES, "GLOBAL"),
    resourceId: str(g.resourceId),
    role: oneOf<GrantRole>(g.role, GRANT_ROLES, "VIEWER"),
  };
}

export function toInvitation(raw: unknown): Invitation {
  const i = obj(raw);
  return {
    id: text(i.id),
    email: text(i.email),
    status: oneOf<InvitationStatus>(i.status, INVITATION_STATUSES, "PENDING"),
    invitedByName: str(i.invitedByName) ?? str(i.invitedBy),
    message: str(i.message),
    expiresAt: str(i.expiresAt),
    createdAt: str(i.createdAt),
    acceptedAt: str(i.acceptedAt),
    inviteUrl: str(i.inviteUrl),
    mailSent: bool(i.mailSent),
    teams: arr(i.teams).map(toTeamPreset),
    grants: arr(i.grants).map(toGrantPreset),
  };
}

export function toMe(raw: unknown): Me {
  const m = obj(raw);
  return {
    ...toMember(raw),
    globalRoles: arr(m.globalRoles)
      .map((r) => str(r))
      .filter((r): r is string => r !== null),
    teams: arr(m.teams).map(toMemberTeamRef),
  };
}

/* ---- 메일 설정 --------------------------------------------------------- */

export const MAIL_MODES = ["none", "external", "relay", "full", "dev"] as const;
export const MAIL_TLS_MODES = ["NONE", "STARTTLS", "SSL"] as const;
export const MAIL_OUTBOX_STATUSES = ["PENDING", "SENT", "FAILED"] as const;

/** 포트·시도 횟수처럼 문자열로 올 수도 있는 정수. 숫자가 아니면 null이다. */
function intOf(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  const s = str(value);
  return s !== null && /^-?\d+$/.test(s) ? Number(s) : null;
}

export function toMailSetting(raw: unknown): MailSetting {
  const m = obj(raw);
  // 모드는 설치 옵션 값이라 대소문자가 흔들릴 수 있다. 모르는 값은 억지로 none으로 읽지 않고
  // null로 두어 화면이 "확인 필요"라고 말하게 한다.
  const mode = str(m.mode)?.toLowerCase() ?? null;
  return {
    enabled: bool(m.enabled) ?? false,
    mode: mode !== null && (MAIL_MODES as readonly string[]).includes(mode) ? (mode as MailMode) : null,
    host: text(m.host),
    port: intOf(m.port),
    username: text(m.username),
    passwordSet: bool(m.passwordSet) ?? false,
    tls: oneOf<MailTls>(m.tls, MAIL_TLS_MODES, "NONE"),
    fromAddress: text(m.fromAddress),
    fromName: text(m.fromName),
    updatedAt: str(m.updatedAt),
    updatedBy: str(m.updatedBy),
  };
}

export function toMailTestResult(raw: unknown): MailTestResult {
  const r = obj(raw);
  return { ok: bool(r.ok) ?? false, error: str(r.error) };
}

export function toMailLogEntry(raw: unknown): MailLogEntry {
  const e = obj(raw);
  return {
    id: text(e.id),
    // 스펙은 `to`, 테이블 컬럼은 `to_address`다 — 둘 다 받는다.
    to: text(e.to, text(e.toAddress, "-")),
    subject: text(e.subject, "(제목 없음)"),
    source: text(e.source, "-"),
    status: oneOf<MailOutboxStatus>(e.status, MAIL_OUTBOX_STATUSES, "PENDING"),
    attempts: intOf(e.attempts) ?? 0,
    lastError: str(e.lastError) ?? str(e.error),
    createdAt: str(e.createdAt),
    sentAt: str(e.sentAt),
  };
}

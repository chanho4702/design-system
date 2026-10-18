/**
 * org-service(`/api/org`) 계약의 프론트 표현.
 *
 * 설계 문서 2026-09-05 §3.3이 원본이다. id는 백엔드에서 BIGINT라 JS number의 안전 범위를
 * 벗어날 수 있으므로 화면에서는 전부 문자열로 다룬다(비교·키·경로에만 쓴다).
 */

export type MemberStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
export type MemberKind = "HUMAN" | "AGENT";
export type JoinedVia = "INVITE" | "APPROVAL" | "BOOTSTRAP" | "LEGACY";
export type GrantScope = "GLOBAL" | "SPACE" | "PROJECT";
export type GrantRole = "VIEWER" | "EDITOR" | "ADMIN";
export type SubjectType = "USER" | "TEAM";
export type TeamRole = "LEAD" | "MEMBER";
export type TeamKind = "STANDARD" | "EVERYONE";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

/** 목록 응답 한 페이지. 백엔드가 배열만 주면 한 페이지로 감싼다(`toPage`). */
export interface Page<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

export interface Member {
  id: string;
  displayName: string;
  email: string | null;
  status: MemberStatus;
  kind: MemberKind;
  joinedVia: JoinedVia | null;
  createdAt: string | null;
}

export interface MemberTeamRef {
  id: string;
  name: string;
  role: TeamRole;
}

export interface Grant {
  id: string;
  subjectType: SubjectType;
  subjectId: string;
  /** 백엔드가 이름을 주면 표시하고, 없으면 화면이 id로 대체한다. */
  subjectName: string | null;
  scope: GrantScope;
  resourceId: string | null;
  role: GrantRole;
}

/** org-service `GrantAudit.Action`에 `GRANT_` 접두사를 붙인 값. 응답은 새 값이 올 수 있어 string으로 받는다. */
export type GrantAuditAction = "GRANT_GRANTED" | "GRANT_CHANGED" | "GRANT_REVOKED";

/**
 * 권한 변경 기록 한 줄(org-service `GET /api/org/grants/audit`, `GrantAuditResponse`).
 * 필드 이름은 wiki-backend 감사 항목과 같다. 서버는 최신순으로 최근 100건까지만 준다.
 */
export interface GrantAuditEntry {
  id: string;
  /** 대개 `GrantAuditAction`이지만 서버가 새 값을 먼저 낼 수 있다 — 화면은 모르는 값을 원문으로 보인다. */
  action: string;
  targetType: SubjectType;
  targetId: string | null;
  /** 기록 당시의 주체 이름(스냅샷). 없으면 화면이 id로 대체한다. */
  targetLabel: string | null;
  /** 역할 이름(VIEWER·EDITOR·ADMIN). CHANGED면 바뀐 뒤의 역할이다. */
  role: string | null;
  actorId: string | null;
  createdAt: string | null;
}

export interface MemberDetail extends Member {
  teams: MemberTeamRef[];
  grants: Grant[];
}

/** org-service `MemberEventType` 열거 그대로. 응답의 `type`은 새 값이 올 수 있어 string으로 받는다. */
export type MemberEventType =
  | "INVITED"
  | "INVITE_RESENT"
  | "INVITE_REVOKED"
  | "INVITE_EXPIRED"
  | "JOINED"
  | "APPROVED"
  | "SUSPENDED"
  | "REACTIVATED"
  | "DEACTIVATED"
  | "TEAM_ADDED"
  | "TEAM_REMOVED"
  | "AVATAR_CHANGED"
  | "AVATAR_REMOVED"
  | "KEYCLOAK_DISABLED_FAILED";

export interface MemberEvent {
  id: string;
  /** 대개 `MemberEventType`이지만 서버가 새 값을 먼저 낼 수 있다 — 화면은 모르는 값을 원문으로 보인다. */
  type: string;
  actorId: string | null;
  actorName: string | null;
  detail: string | null;
  createdAt: string | null;
}

/** 아바타 업로드 응답(org-service `AvatarView`). */
export interface MemberAvatar {
  memberId: string;
  /** 이미지 경로(`?v=`로 캐시를 밀어낸다). 서버가 비워 주면 null. */
  avatarUrl: string | null;
  updatedAt: string | null;
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  kind: TeamKind;
  memberCount: number | null;
  myRole: TeamRole | null;
}

export interface TeamMember {
  id: string;
  displayName: string;
  email: string | null;
  role: TeamRole;
}

export interface TeamPreset {
  teamId: string;
  role: TeamRole;
}

export interface GrantPreset {
  scope: GrantScope;
  resourceId: string | null;
  role: GrantRole;
}

export interface Invitation {
  id: string;
  email: string;
  status: InvitationStatus;
  invitedByName: string | null;
  message: string | null;
  expiresAt: string | null;
  createdAt: string | null;
  acceptedAt: string | null;
  /** PENDING일 때만 재노출된다(링크 복사용). 토큰 자체는 화면에 보이지 않는다. */
  inviteUrl: string | null;
  /**
   * 메일을 발송 대기열(org-service outbox)에 넣었는지. 수신자에게 도착했다는 뜻이 아니다 —
   * 실제 발송 결과는 메일 설정 화면의 발송 로그(`/api/org/settings/mail/log`)에 남는다.
   */
  mailSent: boolean | null;
  teams: TeamPreset[];
  grants: GrantPreset[];
}

export interface Me {
  id: string;
  displayName: string;
  email: string | null;
  status: MemberStatus;
  kind: MemberKind;
  globalRoles: string[];
  teams: MemberTeamRef[];
  joinedVia: JoinedVia | null;
}

export interface MemberQuery {
  status?: MemberStatus | "";
  kind?: MemberKind | "";
  q?: string;
  page?: number;
  size?: number;
}

export interface InvitationQuery {
  status?: InvitationStatus | "";
  q?: string;
  page?: number;
  size?: number;
}

export interface CreateInvitationRequest {
  emails: string[];
  teams: TeamPreset[];
  grants: GrantPreset[];
  message?: string;
}

/* ---- 메일 설정 (설계 2026-09-07 §3) ------------------------------------- */

/** 설치 시점에 고른 인프라 모드. 운영 중 정본은 `mail_setting`이고 이 값은 표시 전용이다. */
export type MailMode = "none" | "external" | "relay" | "full" | "dev";
export type MailTls = "NONE" | "STARTTLS" | "SSL";
export type MailOutboxStatus = "PENDING" | "SENT" | "FAILED";

export interface MailSetting {
  enabled: boolean;
  /** 서버가 모르는 값을 주거나 필드가 없으면 null — 화면은 배지를 "확인 필요"로 그린다. */
  mode: MailMode | null;
  host: string;
  port: number | null;
  username: string;
  /** 비밀번호는 절대 내려오지 않는다. 저장돼 있는지 여부만 온다. */
  passwordSet: boolean;
  tls: MailTls;
  fromAddress: string;
  fromName: string;
  updatedAt: string | null;
  updatedBy: string | null;
}

/** PUT 본문. `password`는 생략하면 유지, `""`이면 삭제다(서버 계약 그대로). */
export interface MailSettingUpdate {
  enabled: boolean;
  host: string;
  port: number | null;
  username: string;
  password?: string;
  tls: MailTls;
  fromAddress: string;
  fromName: string;
}

/** 테스트 발송 결과. `error`는 SMTP가 준 문구 그대로 — 화면이 손대지 않는다. */
export interface MailTestResult {
  ok: boolean;
  error: string | null;
}

export interface MailLogEntry {
  id: string;
  to: string;
  subject: string;
  /** wiki|alm|org|test. 모르는 값은 그대로 보여 준다. */
  source: string;
  status: MailOutboxStatus;
  attempts: number;
  lastError: string | null;
  createdAt: string | null;
  sentAt: string | null;
}

export interface MailLogQuery {
  status?: MailOutboxStatus | "";
  page?: number;
  size?: number;
}

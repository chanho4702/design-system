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

export interface MemberDetail extends Member {
  teams: MemberTeamRef[];
  grants: Grant[];
}

export interface MemberEvent {
  id: string;
  type: string;
  actorId: string | null;
  actorName: string | null;
  detail: string | null;
  createdAt: string | null;
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

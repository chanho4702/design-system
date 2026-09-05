/**
 * `/api/org` 호출 묶음.
 *
 * 네트워크·인증·게이트웨이 경로는 호스트가 넘겨준 `api`(인증 fetch)가 책임진다.
 * 이 패키지는 상대 경로와 응답 모양만 안다. 오류는 공용 계약 `{"error": 메시지}`를 그대로
 * 꺼내 `OrgApiError.message`에 담는다 — 화면은 이 문구를 손대지 않고 토스트로 띄운다.
 */
import {
  toGrant,
  toInvitation,
  toMe,
  toMember,
  toMemberDetail,
  toMemberEvent,
  toPage,
  toTeam,
  toTeamMember,
} from "./mapping";
import type {
  CreateInvitationRequest,
  Grant,
  GrantPreset,
  GrantRole,
  GrantScope,
  Invitation,
  InvitationQuery,
  Me,
  Member,
  MemberDetail,
  MemberEvent,
  MemberQuery,
  MemberStatus,
  Page,
  SubjectType,
  Team,
  TeamMember,
  TeamRole,
} from "./types";

/** 호스트가 주입하는 인증 fetch. 경로는 항상 `/api/org/...` 상대 경로다. */
export type OrgApiFetch = (path: string, init?: RequestInit) => Promise<Response>;

export class OrgApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "OrgApiError";
    this.status = status;
  }
}

const JSON_HEADERS = { "Content-Type": "application/json" };

function query(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

async function errorOf(res: Response): Promise<OrgApiError> {
  let message = `요청이 실패했습니다 (HTTP ${res.status})`;
  try {
    const body: unknown = await res.json();
    if (body && typeof body === "object") {
      const raw = (body as Record<string, unknown>).error ?? (body as Record<string, unknown>).message;
      if (typeof raw === "string" && raw.trim() !== "") message = raw;
    }
  } catch {
    // 본문이 비었거나 JSON이 아니면 기본 문구를 쓴다.
  }
  return new OrgApiError(message, res.status);
}

export function createOrgClient(api: OrgApiFetch) {
  async function call(path: string, init?: RequestInit): Promise<unknown> {
    const res = await api(path, init);
    if (!res.ok) throw await errorOf(res);
    if (res.status === 204) return null;
    const body = await res.text();
    if (body.trim() === "") return null;
    try {
      return JSON.parse(body) as unknown;
    } catch {
      return null;
    }
  }

  function send(path: string, method: string, payload?: unknown): Promise<unknown> {
    return call(path, {
      method,
      headers: payload === undefined ? undefined : JSON_HEADERS,
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
  }

  return {
    // ---- me ----
    async me(): Promise<Me> {
      return toMe(await call("/api/org/me"));
    },

    // ---- members ----
    /**
     * 멤버 검색(배열 응답, 하위 호환 경로). 팀원 추가·권한 대상 같은 선택기가 쓴다.
     * 페이지가 필요한 목록 화면은 `memberPage`를 쓴다.
     */
    async members(q: Omit<MemberQuery, "page" | "size"> = {}): Promise<Member[]> {
      const raw = await call(
        `/api/org/members${query({ status: q.status, kind: q.kind, q: q.q })}`,
      );
      return toPage(raw, toMember, 200).items;
    },

    /** 페이지네이션이 붙은 멤버 목록. 사용자 관리 화면 전용. */
    async memberPage(q: MemberQuery = {}): Promise<Page<Member>> {
      const size = q.size ?? 20;
      const raw = await call(
        `/api/org/members/page${query({ status: q.status, kind: q.kind, q: q.q, page: q.page, size })}`,
      );
      return toPage(raw, toMember, size);
    },

    async member(id: string): Promise<MemberDetail> {
      return toMemberDetail(await call(`/api/org/members/${encodeURIComponent(id)}`));
    },

    /** 상태 전이 전용 — 표시명 편집은 이 패키지가 제공하지 않는다. */
    async patchMember(id: string, patch: { status: MemberStatus }): Promise<void> {
      await send(`/api/org/members/${encodeURIComponent(id)}`, "PATCH", patch);
    },

    async memberEvents(id: string): Promise<MemberEvent[]> {
      const raw = await call(`/api/org/members/${encodeURIComponent(id)}/events`);
      return toPage(raw, toMemberEvent, 100).items;
    },

    async pendingMembers(): Promise<Member[]> {
      return toPage(await call("/api/org/members/pending"), toMember, 100).items;
    },

    async approveMember(
      id: string,
      body: { teamIds?: string[]; grants?: GrantPreset[] } = {},
    ): Promise<void> {
      await send(`/api/org/members/${encodeURIComponent(id)}/approve`, "POST", body);
    },

    // ---- invitations ----
    async invitations(q: InvitationQuery = {}): Promise<Page<Invitation>> {
      const size = q.size ?? 20;
      const raw = await call(
        `/api/org/invitations${query({ status: q.status, q: q.q, page: q.page, size })}`,
      );
      return toPage(raw, toInvitation, size);
    },

    async createInvitations(body: CreateInvitationRequest): Promise<Invitation[]> {
      const raw = await send("/api/org/invitations", "POST", body);
      return toPage(raw, toInvitation, body.emails.length).items;
    },

    async resendInvitation(id: string): Promise<Invitation | null> {
      const raw = await send(`/api/org/invitations/${encodeURIComponent(id)}/resend`, "POST");
      return raw === null ? null : toInvitation(raw);
    },

    async revokeInvitation(id: string): Promise<void> {
      await send(`/api/org/invitations/${encodeURIComponent(id)}`, "DELETE");
    },

    // ---- teams ----
    async teams(q?: string): Promise<Team[]> {
      return toPage(await call(`/api/org/teams${query({ q })}`), toTeam, 200).items;
    },

    async createTeam(body: { name: string; description?: string }): Promise<Team> {
      return toTeam(await send("/api/org/teams", "POST", body));
    },

    async renameTeam(id: string, body: { name: string; description?: string }): Promise<Team> {
      return toTeam(await send(`/api/org/teams/${encodeURIComponent(id)}`, "PUT", body));
    },

    async deleteTeam(id: string): Promise<void> {
      await send(`/api/org/teams/${encodeURIComponent(id)}`, "DELETE");
    },

    async teamMembers(id: string): Promise<TeamMember[]> {
      const raw = await call(`/api/org/teams/${encodeURIComponent(id)}/members`);
      return toPage(raw, toTeamMember, 200).items;
    },

    async addTeamMember(id: string, memberId: string, role: TeamRole): Promise<void> {
      await send(
        `/api/org/teams/${encodeURIComponent(id)}/members/${encodeURIComponent(memberId)}${query({ role })}`,
        "PUT",
      );
    },

    async setTeamMemberRole(id: string, memberId: string, role: TeamRole): Promise<void> {
      await send(
        `/api/org/teams/${encodeURIComponent(id)}/members/${encodeURIComponent(memberId)}`,
        "PATCH",
        { role },
      );
    },

    async removeTeamMember(id: string, memberId: string): Promise<void> {
      await send(
        `/api/org/teams/${encodeURIComponent(id)}/members/${encodeURIComponent(memberId)}`,
        "DELETE",
      );
    },

    // ---- grants ----
    async grants(scope: GrantScope, resourceId?: string): Promise<Grant[]> {
      const raw = await call(`/api/org/grants${query({ resourceType: scope, resourceId })}`);
      return toPage(raw, toGrant, 200).items;
    },

    async createGrant(body: {
      subjectType: SubjectType;
      subjectId: string;
      scope: GrantScope;
      resourceId?: string | null;
      role: GrantRole;
    }): Promise<Grant> {
      const raw = await send("/api/org/grants", "POST", {
        subjectType: body.subjectType,
        subjectId: body.subjectId,
        resourceType: body.scope,
        resourceId: body.resourceId ?? null,
        role: body.role,
      });
      return toGrant(raw);
    },

    async patchGrant(id: string, role: GrantRole): Promise<void> {
      await send(`/api/org/grants/${encodeURIComponent(id)}`, "PATCH", { role });
    },

    async deleteGrant(id: string): Promise<void> {
      await send(`/api/org/grants/${encodeURIComponent(id)}`, "DELETE");
    },
  };
}

export type OrgClient = ReturnType<typeof createOrgClient>;

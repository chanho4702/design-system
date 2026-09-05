import type { OrgApiFetch } from "../api/client";

export interface FakeCall {
  method: string;
  path: string;
  body: unknown;
}

export type FakeHandler = (context: {
  method: string;
  /** 쿼리스트링을 뺀 경로. */
  path: string;
  params: URLSearchParams;
  body: unknown;
}) => unknown;

export interface FakeApi {
  api: OrgApiFetch;
  calls: FakeCall[];
}

/** 핸들러가 이 값을 돌려주면 그 상태 코드와 `{"error"}` 본문으로 응답한다. */
export class FakeError {
  constructor(
    readonly status: number,
    readonly message: string,
  ) {}
}

function response(body: unknown, status: number): Response {
  // 204는 본문을 가질 수 없다(빈 문자열도 본문이다) — jsdom의 Response가 이를 강제한다.
  const text = body === null || body === undefined ? null : JSON.stringify(body);
  return new Response(text, {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * 테스트용 인증 fetch. `routes`의 키는 `"<METHOD> <경로 패턴>"`이고, 패턴의 `:id`는 한 조각을 받는다.
 * 호출 기록은 `calls`에 남는다 — 화면이 무엇을 보냈는지 검증할 때 쓴다.
 */
export function createFakeApi(routes: Record<string, FakeHandler>): FakeApi {
  const calls: FakeCall[] = [];
  const compiled = Object.entries(routes).map(([key, handler]) => {
    const [method, pattern] = key.split(" ");
    const source = `^${pattern.replace(/:[A-Za-z]+/g, "[^/]+")}$`;
    return { method, matcher: new RegExp(source), handler };
  });

  const api: OrgApiFetch = (path, init) => {
    const method = (init?.method ?? "GET").toUpperCase();
    const [pathname, search = ""] = path.split("?");
    const body = typeof init?.body === "string" ? (JSON.parse(init.body) as unknown) : undefined;
    calls.push({ method, path, body });

    const route = compiled.find((r) => r.method === method && r.matcher.test(pathname));
    if (!route) {
      return Promise.resolve(response({ error: `핸들러 없음: ${method} ${pathname}` }, 404));
    }
    let result: unknown;
    try {
      result = route.handler({ method, path: pathname, params: new URLSearchParams(search), body });
    } catch (cause) {
      return Promise.resolve(
        response({ error: cause instanceof Error ? cause.message : "실패" }, 500),
      );
    }
    if (result instanceof FakeError) {
      return Promise.resolve(response({ error: result.message }, result.status));
    }
    if (result === undefined) return Promise.resolve(response(null, 204));
    return Promise.resolve(response(result, 200));
  };

  return { api, calls };
}

/** 경로의 마지막 조각(대개 id). */
export function lastSegment(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

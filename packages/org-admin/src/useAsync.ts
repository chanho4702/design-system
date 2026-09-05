import { useCallback, useEffect, useRef, useState } from "react";

export interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  /** 서버가 준 `{"error"}` 문구 그대로. 없으면 null. */
  error: string | null;
  reload: () => void;
}

/**
 * 로드 → 표시 한 벌. 마지막 요청만 반영하고(늦게 온 응답 무시), 언마운트 후 setState를 막는다.
 * `deps`가 바뀌면 다시 부른다.
 */
export function useAsync<T>(load: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const seq = useRef(0);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    seq.current += 1;
    const mine = seq.current;
    setLoading(true);
    setError(null);
    load().then(
      (result) => {
        if (!alive.current || seq.current !== mine) return;
        setData(result);
        setLoading(false);
      },
      (cause: unknown) => {
        if (!alive.current || seq.current !== mine) return;
        setError(cause instanceof Error ? cause.message : "불러오지 못했습니다");
        setLoading(false);
      },
    );
    // load는 매 렌더 새 함수라 deps에 넣지 않는다 — 호출자가 준 deps가 진짜 의존성이다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { data, loading, error, reload };
}

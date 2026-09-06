import { useEffect, useMemo, useState } from "react";
import {
  Banner,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Lozenge,
  Select,
  Switch,
  Table,
  TextField,
  useToast,
} from "@chanho/react";
import type { TableColumn } from "@chanho/react";
import { useOrgAdmin } from "../context";
import { useAsync } from "../useAsync";
import { DataSection } from "../components/DataSection";
import { Pagination } from "../components/Pagination";
import {
  MAIL_MODE_HINT,
  MAIL_MODE_LABEL,
  MAIL_STATUS_LABEL,
  MAIL_TLS_LABEL,
  formatDateTime,
  isValidEmail,
  mailSourceLabel,
} from "../format";
import { MailStatusLozenge } from "./StatusLozenge";
import type {
  MailLogEntry,
  MailMode,
  MailOutboxStatus,
  MailSetting,
  MailTls,
  Page,
} from "../api/types";
import styles from "./screen.module.css";

const PAGE_SIZE = 20;
/** Radix Select는 빈 문자열 값을 허용하지 않는다 — "전체"는 자리표시 값으로 다룬다. */
const ALL = "ALL";

const TLS_OPTIONS = (["NONE", "STARTTLS", "SSL"] as const).map((value) => ({
  value,
  label: MAIL_TLS_LABEL[value],
}));

const LOG_STATUS_OPTIONS = [
  { value: ALL, label: "전체" },
  ...(["PENDING", "SENT", "FAILED"] as const).map((value) => ({
    value,
    label: MAIL_STATUS_LABEL[value],
  })),
];

const MODE_APPEARANCE: Record<MailMode, "neutral" | "info" | "success" | "warning"> = {
  none: "neutral",
  external: "info",
  relay: "info",
  full: "success",
  dev: "warning",
};

const EMPTY_LOG: Page<MailLogEntry> = { items: [], page: 0, size: PAGE_SIZE, total: 0 };

/** 폼은 전부 문자열로 들고 있다가 저장할 때만 계약 타입으로 바꾼다(빈 포트를 표현하기 위해). */
interface MailForm {
  enabled: boolean;
  host: string;
  port: string;
  username: string;
  password: string;
  /** 비밀번호 칸을 건드렸는지. 안 건드렸으면 PUT에서 키 자체를 뺀다(= 서버가 유지). */
  passwordTouched: boolean;
  tls: MailTls;
  fromAddress: string;
  fromName: string;
}

function toForm(setting: MailSetting): MailForm {
  return {
    enabled: setting.enabled,
    host: setting.host,
    port: setting.port === null ? "" : String(setting.port),
    username: setting.username,
    password: "",
    passwordTouched: false,
    tls: setting.tls,
    fromAddress: setting.fromAddress,
    fromName: setting.fromName,
  };
}

type FieldErrors = Partial<Record<"host" | "port" | "fromAddress", string>>;

/**
 * 화면 검증은 서버 규칙(설계 §3: enabled면 host·port·fromAddress 필수)을 앞당겨 보여 주기만 한다.
 * 최종 판정은 서버가 하고, 서버가 거부하면 그 문구를 그대로 띄운다.
 */
function validate(form: MailForm): FieldErrors {
  if (!form.enabled) return {};
  const errors: FieldErrors = {};
  if (form.host.trim() === "") errors.host = "호스트를 입력하세요";

  const port = form.port.trim();
  if (port === "") errors.port = "포트를 입력하세요";
  else if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
    errors.port = "포트는 1~65535 사이의 숫자입니다";
  }

  const from = form.fromAddress.trim();
  if (from === "") errors.fromAddress = "보내는 주소를 입력하세요";
  else if (!isValidEmail(from)) errors.fromAddress = "보내는 주소 형식이 올바르지 않습니다";

  return errors;
}

/**
 * 메일 설정 — 플랫폼 발송 설정(org-service `mail_setting`)과 발송 로그(`mail_outbox`).
 *
 * 발송은 org-service 한 곳이 하고 위키·ALM은 내부 API로 넘긴다(설계 2026-09-07 §1). 그래서 이
 * 화면 하나가 플랫폼 전체의 메일 스위치다. 전역 관리자 전용이며, 비밀번호는 내려오지 않고
 * "저장돼 있는지"만 온다.
 */
export function MailScreen() {
  const { client, isGlobalAdmin } = useOrgAdmin();
  const toast = useToast();

  const setting = useAsync(
    () => (isGlobalAdmin ? client.mailSetting() : Promise.resolve(null)),
    [client, isGlobalAdmin],
  );
  // 테스트 발송 기본 수신자는 내 주소다. 실패해도 화면을 막지 않는다(주소 칸이 빈 채로 열린다).
  const me = useAsync(
    () => (isGlobalAdmin ? client.me().catch(() => null) : Promise.resolve(null)),
    [client, isGlobalAdmin],
  );

  const [form, setForm] = useState<MailForm | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [clearingPassword, setClearingPassword] = useState(false);

  const [testTo, setTestTo] = useState("");
  const [testTouched, setTestTouched] = useState(false);
  const [testing, setTesting] = useState(false);

  const [logStatus, setLogStatus] = useState<MailOutboxStatus | typeof ALL>(ALL);
  const [page, setPage] = useState(0);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const log = useAsync(
    () =>
      isGlobalAdmin
        ? client.mailLog({ status: logStatus === ALL ? "" : logStatus, page, size: PAGE_SIZE })
        : Promise.resolve(EMPTY_LOG),
    [client, isGlobalAdmin, logStatus, page],
  );

  // 서버가 준 값이 폼의 출발점이다. 저장 뒤 reload에서도 이 경로로 다시 맞춰진다.
  useEffect(() => {
    if (setting.data) setForm(toForm(setting.data));
  }, [setting.data]);

  useEffect(() => {
    const email = me.data?.email;
    if (email && !testTouched) setTestTo(email);
  }, [me.data, testTouched]);

  const fail = (cause: unknown, fallback: string) =>
    toast({ title: cause instanceof Error ? cause.message : fallback, appearance: "danger" });

  const patch = (change: Partial<MailForm>) =>
    setForm((current) => (current === null ? current : { ...current, ...change }));

  const doSave = (password: string | undefined) => {
    if (!form) return;
    setSaving(true);
    client
      .saveMailSetting({
        enabled: form.enabled,
        host: form.host.trim(),
        port: form.port.trim() === "" ? null : Number(form.port.trim()),
        username: form.username.trim(),
        password,
        tls: form.tls,
        fromAddress: form.fromAddress.trim(),
        fromName: form.fromName.trim(),
      })
      .then(
        () => {
          setSaving(false);
          setClearingPassword(false);
          toast({ title: "메일 설정을 저장했습니다", appearance: "success" });
          setting.reload();
        },
        (cause: unknown) => {
          setSaving(false);
          setClearingPassword(false);
          fail(cause, "메일 설정을 저장하지 못했습니다");
        },
      );
  };

  const save = () => {
    if (!form) return;
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast({ title: "입력한 값을 확인해 주세요", appearance: "danger" });
      return;
    }
    // 비운 채로 저장 = 저장된 비밀번호 삭제. 되돌릴 수 없으니 한 번 묻는다.
    if (form.passwordTouched && form.password === "" && setting.data?.passwordSet) {
      setClearingPassword(true);
      return;
    }
    doSave(form.passwordTouched ? form.password : undefined);
  };

  const sendTest = () => {
    setTesting(true);
    client.testMail(testTo).then(
      (result) => {
        setTesting(false);
        if (result.ok) {
          toast({ title: "테스트 메일을 보냈습니다", appearance: "success" });
        } else {
          // SMTP가 준 문구를 그대로 보여 준다 — 원인을 알아야 고칠 수 있다.
          toast({ title: result.error ?? "테스트 발송에 실패했습니다", appearance: "danger" });
        }
        log.reload();
      },
      (cause: unknown) => {
        setTesting(false);
        fail(cause, "테스트 발송에 실패했습니다");
      },
    );
  };

  const retry = (entry: MailLogEntry) => {
    setRetryingId(entry.id);
    client.retryMail(entry.id).then(
      () => {
        setRetryingId(null);
        toast({ title: "다시 보내기를 예약했습니다", appearance: "success" });
        log.reload();
      },
      (cause: unknown) => {
        setRetryingId(null);
        fail(cause, "다시 보내지 못했습니다");
      },
    );
  };

  const columns = useMemo<TableColumn<MailLogEntry>[]>(
    () => [
      { key: "to", header: "받는 주소" },
      { key: "subject", header: "제목" },
      { key: "source", header: "출처", render: (row) => mailSourceLabel(row.source) },
      { key: "status", header: "상태", render: (row) => <MailStatusLozenge status={row.status} /> },
      { key: "attempts", header: "시도", align: "right" },
      {
        key: "lastError",
        header: "오류",
        render: (row) =>
          row.lastError ? (
            <span className={styles.errorCell} title={row.lastError}>
              {row.lastError}
            </span>
          ) : (
            "-"
          ),
      },
      {
        key: "time",
        header: "시각",
        // 보낸 시각이 있으면 그것, 없으면 큐에 들어간 시각.
        render: (row) => formatDateTime(row.sentAt ?? row.createdAt),
      },
      {
        key: "actions",
        header: "",
        ariaLabel: "작업",
        adjustable: false,
        render: (row) =>
          row.status === "FAILED" ? (
            <Button
              variant="secondary"
              size="small"
              loading={retryingId === row.id}
              onClick={() => retry(row)}
            >
              다시 보내기
            </Button>
          ) : null,
      },
    ],
    // retry는 매 렌더 새로 만들어지지만 동작이 같다 — 진행 중 표시만 실제 의존성이다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [retryingId],
  );

  if (!isGlobalAdmin) {
    return (
      <div className={styles.screen}>
        <EmptyState
          title="메일 설정은 전역 관리자만 볼 수 있습니다"
          description="플랫폼 전체의 발송 설정과 자격증명을 다루는 화면입니다."
        />
      </div>
    );
  }

  const mode = setting.data?.mode ?? null;
  const items = log.data?.items ?? [];

  return (
    <div className={styles.screen}>
      <DataSection loading={setting.loading} error={setting.error} onRetry={setting.reload}>
        {form && setting.data ? (
          <>
            <div className={styles.modeBar}>
              <span className={styles.modeLabel}>설치 모드</span>
              {mode === null ? (
                <Lozenge appearance="neutral">확인 필요</Lozenge>
              ) : (
                <Lozenge appearance={MODE_APPEARANCE[mode]}>{MAIL_MODE_LABEL[mode]}</Lozenge>
              )}
              <p className={styles.subtle}>
                {mode === null
                  ? "서버가 설치 모드를 알려 주지 않았습니다. 설정 값만 표시합니다."
                  : MAIL_MODE_HINT[mode]}
              </p>
            </div>

            {setting.data.enabled ? null : (
              <Banner variant="warning">
                메일 발송이 꺼져 있습니다. 초대·알림 메일은 나가지 않고, 초대는 링크 복사로만
                전달됩니다.
              </Banner>
            )}

            <Card title="SMTP 설정">
              <div className={styles.formGrid}>
                <Switch
                  label="메일 발송 사용"
                  checked={form.enabled}
                  onCheckedChange={(next: boolean) => patch({ enabled: next })}
                />
                <TextField
                  label="호스트"
                  placeholder="smtp.example.com"
                  value={form.host}
                  error={errors.host}
                  onChange={(event) => patch({ host: event.target.value })}
                />
                <TextField
                  label="포트"
                  inputMode="numeric"
                  placeholder="587"
                  value={form.port}
                  error={errors.port}
                  onChange={(event) => patch({ port: event.target.value })}
                />
                <TextField
                  label="사용자"
                  autoComplete="off"
                  description="인증이 필요 없는 릴레이라면 비워 둡니다."
                  value={form.username}
                  onChange={(event) => patch({ username: event.target.value })}
                />
                <div className={styles.stack}>
                  <TextField
                    label="비밀번호"
                    type="password"
                    autoComplete="new-password"
                    placeholder={setting.data.passwordSet ? "저장됨" : ""}
                    description={
                      setting.data.passwordSet
                        ? "저장됨 · 변경하려면 입력하세요. 입력란을 비운 채 저장하면 삭제합니다."
                        : "저장된 비밀번호가 없습니다."
                    }
                    value={form.password}
                    onChange={(event) =>
                      patch({ password: event.target.value, passwordTouched: true })
                    }
                  />
                  {setting.data.passwordSet ? (
                    <div className={styles.formActions}>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => {
                          patch({ password: "", passwordTouched: true });
                          setClearingPassword(true);
                        }}
                      >
                        비밀번호 삭제
                      </Button>
                    </div>
                  ) : null}
                </div>
                <Select
                  label="TLS"
                  options={TLS_OPTIONS}
                  value={form.tls}
                  onValueChange={(next) => patch({ tls: next as MailTls })}
                />
                <TextField
                  label="보내는 주소"
                  type="email"
                  placeholder="no-reply@example.com"
                  value={form.fromAddress}
                  error={errors.fromAddress}
                  onChange={(event) => patch({ fromAddress: event.target.value })}
                />
                <TextField
                  label="보내는 이름"
                  placeholder="플랫폼"
                  value={form.fromName}
                  onChange={(event) => patch({ fromName: event.target.value })}
                />
                <div className={styles.formActions}>
                  <Button loading={saving} onClick={save}>
                    저장
                  </Button>
                </div>
                {setting.data.updatedAt ? (
                  <p className={styles.subtle}>
                    마지막 수정 {formatDateTime(setting.data.updatedAt)}
                    {setting.data.updatedBy ? ` · 수정자 ${setting.data.updatedBy}` : ""}
                  </p>
                ) : null}
              </div>
            </Card>

            <Card title="테스트 발송">
              <div className={styles.formGrid}>
                <p className={styles.subtle}>
                  저장된 설정으로 한 통을 즉시 보냅니다. 실패하면 서버가 받은 SMTP 오류 문구를 그대로
                  보여 줍니다.
                </p>
                <TextField
                  label="받는 주소"
                  type="email"
                  placeholder="비우면 내 계정 주소로 보냅니다"
                  value={testTo}
                  onChange={(event) => {
                    setTestTo(event.target.value);
                    setTestTouched(true);
                  }}
                />
                <div className={styles.formActions}>
                  <Button variant="secondary" loading={testing} onClick={sendTest}>
                    테스트 발송
                  </Button>
                </div>
              </div>
            </Card>
          </>
        ) : null}
      </DataSection>

      <div className={styles.stack}>
        <h3 className={styles.sectionTitle}>발송 로그</h3>
        <div className={styles.toolbar}>
          <Select
            label="상태"
            options={LOG_STATUS_OPTIONS}
            value={logStatus}
            onValueChange={(next) => {
              setLogStatus(next as MailOutboxStatus | typeof ALL);
              setPage(0);
            }}
          />
          <div className={styles.toolbarEnd}>
            <Button variant="secondary" size="small" onClick={log.reload}>
              새로 고침
            </Button>
          </div>
        </div>

        <DataSection
          loading={log.loading}
          error={log.error}
          empty={items.length === 0}
          emptyTitle="발송 기록이 없습니다"
          onRetry={log.reload}
        >
          <Table aria-label="발송 로그" columns={columns} rows={items} />
          {/* 로그 응답은 `{items, total}`만 준다(설계 §3) — 현재 페이지는 화면이 기억한 값이 정본이다. */}
          <Pagination
            page={page}
            size={log.data?.size ?? PAGE_SIZE}
            total={log.data?.total ?? 0}
            onPageChange={setPage}
          />
        </DataSection>
      </div>

      <ConfirmDialog
        open={clearingPassword}
        onOpenChange={(open) => (open ? undefined : setClearingPassword(false))}
        title="저장된 비밀번호를 삭제합니다"
        description="이 설정으로 저장하면 SMTP 비밀번호가 지워집니다. 인증이 필요한 서버라면 발송이 실패합니다."
        confirmLabel="삭제하고 저장"
        danger
        loading={saving}
        onConfirm={() => doSave("")}
      />
    </div>
  );
}

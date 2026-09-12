import { useState } from "react";
import { Button, Card, Table, TextArea, TextField, useToast } from "@chanho/react";
import type { TableColumn } from "@chanho/react";
import { useOrgAdmin } from "../context";
import { useAsync } from "../useAsync";
import { CopyButton } from "../components/CopyButton";
import { GrantPresetEditor } from "../components/GrantPresetEditor";
import { MailLogLink } from "../components/MailLogLink";
import { TeamPresetEditor } from "../components/TeamPresetEditor";
import { isValidEmail, splitEmails } from "../format";
import { InvitationStatusLozenge } from "./StatusLozenge";
import type { GrantPreset, Invitation, TeamPreset } from "../api/types";
import styles from "./screen.module.css";

export interface InviteFormProps {
  onClose: () => void;
  /** 초대가 생성되면 목록을 다시 읽게 한다. */
  onCreated: () => void;
  /** 미리 채울 리소스 권한 프리셋(호스트의 "초대하기" 링크에서 온다). 마운트 시 한 번만 반영한다. */
  initialGrants?: GrantPreset[];
}

/**
 * 새 초대. 이메일은 붙여넣기 덩어리를 쉼표·줄바꿈·공백으로 나누고, 형식이 틀린 것만 인라인으로
 * 짚어 준다.
 *
 * 결과의 `mailSent`는 "보냈다"가 아니라 "발송 대기열(org-service outbox)에 넣었다"는 뜻이다 —
 * 실제 발송 결과는 메일 설정 화면의 발송 로그에 있으므로 그쪽 링크를 함께 둔다. 허브가 꺼져
 * 있으면(`mailSent=false`) 링크 복사가 유일한 경로라 그 안내는 그대로 유지한다.
 */
export function InviteForm({ onClose, onCreated, initialGrants }: InviteFormProps) {
  const { client, isGlobalAdmin } = useOrgAdmin();
  const toast = useToast();
  const [raw, setRaw] = useState("");
  const [message, setMessage] = useState("");
  const [teams, setTeams] = useState<TeamPreset[]>([]);
  const [grants, setGrants] = useState<GrantPreset[]>(initialGrants ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<Invitation[] | null>(null);

  const teamList = useAsync(() => client.teams(), [client]);

  const emails = splitEmails(raw);
  const invalid = emails.filter((email) => !isValidEmail(email));
  const emailError =
    invalid.length > 0 ? `이메일 형식이 올바르지 않습니다: ${invalid.join(", ")}` : undefined;
  const canSubmit = emails.length > 0 && invalid.length === 0 && !submitting;

  const submit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    client
      .createInvitations({
        emails,
        teams,
        grants,
        message: message.trim() === "" ? undefined : message.trim(),
      })
      .then(
        (created) => {
          setSubmitting(false);
          setResults(created);
          setRaw("");
          setMessage("");
          setTeams([]);
          setGrants([]);
          const queued = created.filter((row) => row.mailSent).length;
          toast({
            title: `초대 ${created.length}건을 만들었습니다`,
            description:
              queued > 0
                ? `메일 ${queued}건을 발송 대기열에 넣었습니다. 실제 발송 결과는 메일 설정의 발송 로그에서 확인하세요.`
                : "메일 발송이 꺼져 있습니다 — 초대 링크를 복사해 전달하세요.",
            appearance: "success",
          });
          onCreated();
        },
        (cause: unknown) => {
          setSubmitting(false);
          toast({
            title: cause instanceof Error ? cause.message : "초대를 만들지 못했습니다",
            appearance: "danger",
          });
        },
      );
  };

  const resultColumns: TableColumn<Invitation>[] = [
    { key: "email", header: "이메일" },
    {
      key: "status",
      header: "상태",
      render: (row) => <InvitationStatusLozenge status={row.status} />,
    },
    {
      key: "mailSent",
      header: "메일",
      render: (row) => (row.mailSent ? "발송 대기열에 넣음" : "미발송 — 링크를 전달하세요"),
    },
    {
      key: "inviteUrl",
      header: "초대 링크",
      adjustable: false,
      render: (row) =>
        row.inviteUrl ? (
          <CopyButton value={row.inviteUrl} label={`${row.email} 초대 링크 복사`} />
        ) : (
          "-"
        ),
    },
  ];

  return (
    <Card title="새 초대">
      <div className={styles.formGrid}>
        <TextArea
          label="이메일"
          rows={3}
          value={raw}
          placeholder="쉼표·줄바꿈·공백으로 여러 개를 한 번에 붙여넣을 수 있습니다"
          description={emails.length > 0 ? `${emails.length}개 주소` : undefined}
          error={emailError}
          onChange={(event) => setRaw(event.target.value)}
        />

        <TeamPresetEditor teams={teamList.data ?? []} value={teams} onChange={setTeams} />

        <GrantPresetEditor value={grants} onChange={setGrants} allowGlobal={isGlobalAdmin} />

        <TextField
          label="메시지"
          value={message}
          placeholder="초대 메일에 함께 보낼 한 줄 (선택)"
          onChange={(event) => setMessage(event.target.value)}
        />

        <div className={styles.formActions}>
          <Button onClick={submit} disabled={!canSubmit} loading={submitting}>
            초대 보내기
          </Button>
          <Button variant="subtle" onClick={onClose}>
            닫기
          </Button>
        </div>

        {results ? (
          <section className={styles.stack}>
            <div className={styles.inlineRow}>
              <h3 className={styles.sectionTitle}>초대 결과</h3>
              {results.some((row) => row.mailSent) ? <MailLogLink /> : null}
            </div>
            <p className={styles.subtle}>
              {results.some((row) => row.mailSent)
                ? "메일을 발송 대기열에 넣었습니다. 실제 발송 결과는 메일 설정의 발송 로그에서 확인하세요."
                : "메일 발송이 꺼져 있습니다 — 초대 링크를 복사해 전달하세요."}
            </p>
            <Table aria-label="초대 결과" columns={resultColumns} rows={results} />
          </section>
        ) : null}
      </div>
    </Card>
  );
}

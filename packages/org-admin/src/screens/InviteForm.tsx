import { useState } from "react";
import { Button, Card, Table, TextArea, TextField, useToast } from "@chanho/react";
import type { TableColumn } from "@chanho/react";
import { useOrgAdmin } from "../context";
import { useAsync } from "../useAsync";
import { CopyButton } from "../components/CopyButton";
import { GrantPresetEditor } from "../components/GrantPresetEditor";
import { TeamPresetEditor } from "../components/TeamPresetEditor";
import { isValidEmail, splitEmails } from "../format";
import { InvitationStatusLozenge } from "./StatusLozenge";
import type { GrantPreset, Invitation, TeamPreset } from "../api/types";
import styles from "./screen.module.css";

export interface InviteFormProps {
  onClose: () => void;
  /** 초대가 생성되면 목록을 다시 읽게 한다. */
  onCreated: () => void;
}

/**
 * 새 초대. 이메일은 붙여넣기 덩어리를 쉼표·줄바꿈·공백으로 나누고, 형식이 틀린 것만 인라인으로
 * 짚어 준다. 결과는 발송 여부와 초대 링크를 함께 보여 준다 — 메일이 없으면 링크 복사가 유일한 경로다.
 */
export function InviteForm({ onClose, onCreated }: InviteFormProps) {
  const { client, isGlobalAdmin } = useOrgAdmin();
  const toast = useToast();
  const [raw, setRaw] = useState("");
  const [message, setMessage] = useState("");
  const [teams, setTeams] = useState<TeamPreset[]>([]);
  const [grants, setGrants] = useState<GrantPreset[]>([]);
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
          toast({ title: `초대 ${created.length}건을 만들었습니다`, appearance: "success" });
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
      render: (row) => (row.mailSent ? "발송됨" : "미발송 — 링크를 전달하세요"),
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
            <h3 className={styles.sectionTitle}>초대 결과</h3>
            <Table aria-label="초대 결과" columns={resultColumns} rows={results} />
          </section>
        ) : null}
      </div>
    </Card>
  );
}

import { useMemo, useState } from "react";
import { Button, ConfirmDialog, Table, Tabs, TextField, useToast } from "@chanho/react";
import type { TableColumn } from "@chanho/react";
import { useOrgClient } from "../context";
import { useAsync } from "../useAsync";
import { CopyButton } from "../components/CopyButton";
import { DataSection } from "../components/DataSection";
import { Pagination } from "../components/Pagination";
import { INVITATION_STATUS_LABEL, formatDate } from "../format";
import { InviteForm } from "./InviteForm";
import { InvitationStatusLozenge } from "./StatusLozenge";
import type { Invitation, InvitationStatus } from "../api/types";
import styles from "./screen.module.css";

const PAGE_SIZE = 20;
const TAB_STATUSES: InvitationStatus[] = ["PENDING", "ACCEPTED", "EXPIRED", "REVOKED"];

/** 초대 화면 — 새 초대 폼 + 상태 탭 목록(재발송·철회·링크 복사). */
export function InvitationsScreen() {
  const client = useOrgClient();
  const toast = useToast();
  const [status, setStatus] = useState<InvitationStatus>("PENDING");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<Invitation | null>(null);

  const result = useAsync(
    () => client.invitations({ status, q: term, page, size: PAGE_SIZE }),
    [client, status, term, page],
  );

  const fail = (cause: unknown, fallback: string) => {
    toast({
      title: cause instanceof Error ? cause.message : fallback,
      appearance: "danger",
    });
  };

  const resend = (invitation: Invitation) => {
    setBusyId(invitation.id);
    client.resendInvitation(invitation.id).then(
      () => {
        setBusyId(null);
        toast({ title: "초대를 다시 보냈습니다", appearance: "success" });
        result.reload();
      },
      (cause: unknown) => {
        setBusyId(null);
        fail(cause, "초대를 다시 보내지 못했습니다");
      },
    );
  };

  const revoke = () => {
    if (!revoking) return;
    setBusyId(revoking.id);
    client.revokeInvitation(revoking.id).then(
      () => {
        setBusyId(null);
        setRevoking(null);
        toast({ title: "초대를 철회했습니다", appearance: "success" });
        result.reload();
      },
      (cause: unknown) => {
        setBusyId(null);
        setRevoking(null);
        fail(cause, "초대를 철회하지 못했습니다");
      },
    );
  };

  const columns = useMemo<TableColumn<Invitation>[]>(
    () => [
      { key: "email", header: "이메일" },
      {
        key: "status",
        header: "상태",
        render: (row) => <InvitationStatusLozenge status={row.status} />,
      },
      { key: "invitedByName", header: "초대자", render: (row) => row.invitedByName ?? "-" },
      { key: "createdAt", header: "보낸 날짜", render: (row) => formatDate(row.createdAt) },
      { key: "expiresAt", header: "만료", render: (row) => formatDate(row.expiresAt) },
      {
        key: "actions",
        header: "",
        adjustable: false,
        render: (row) =>
          row.status === "PENDING" ? (
            <span className={styles.rowActions}>
              {row.inviteUrl ? (
                <CopyButton value={row.inviteUrl} label={`${row.email} 초대 링크 복사`} />
              ) : null}
              <Button
                variant="secondary"
                size="small"
                loading={busyId === row.id}
                onClick={() => resend(row)}
              >
                재발송
              </Button>
              <Button variant="danger" size="small" onClick={() => setRevoking(row)}>
                철회
              </Button>
            </span>
          ) : null,
      },
    ],
    // resend/setRevoking은 매 렌더 새로 만들어지지만 동작이 같다 — busyId만 실제 의존성이다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busyId],
  );

  const items = result.data?.items ?? [];

  const list = (
    <div className={styles.stack}>
      <DataSection
        loading={result.loading}
        error={result.error}
        empty={items.length === 0}
        emptyTitle={`${INVITATION_STATUS_LABEL[status]} 상태의 초대가 없습니다`}
        onRetry={result.reload}
      >
        <Table aria-label="초대 목록" columns={columns} rows={items} />
        <Pagination
          page={result.data?.page ?? 0}
          size={result.data?.size ?? PAGE_SIZE}
          total={result.data?.total ?? 0}
          onPageChange={setPage}
        />
      </DataSection>
    </div>
  );

  return (
    <div className={styles.screen}>
      <div className={styles.toolbar}>
        <TextField
          className={styles.toolbarGrow}
          label="초대 검색"
          placeholder="이메일"
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            setPage(0);
          }}
        />
        <div className={styles.toolbarEnd}>
          <Button onClick={() => setFormOpen((open) => !open)}>
            {formOpen ? "새 초대 닫기" : "새 초대"}
          </Button>
        </div>
      </div>

      {formOpen ? (
        <InviteForm onClose={() => setFormOpen(false)} onCreated={result.reload} />
      ) : null}

      <Tabs
        label="초대 상태"
        value={status}
        onValueChange={(next) => {
          setStatus(next as InvitationStatus);
          setPage(0);
        }}
        items={TAB_STATUSES.map((value) => ({
          value,
          label: INVITATION_STATUS_LABEL[value],
          content: value === status ? list : null,
        }))}
      />

      <ConfirmDialog
        open={revoking !== null}
        onOpenChange={(open) => (open ? undefined : setRevoking(null))}
        title="초대를 철회합니다"
        description={
          revoking ? `${revoking.email} 앞으로 보낸 초대 링크가 즉시 무효가 됩니다.` : undefined
        }
        confirmLabel="철회"
        danger
        loading={busyId !== null && busyId === revoking?.id}
        onConfirm={revoke}
      />
    </div>
  );
}

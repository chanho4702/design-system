import { useMemo, useState } from "react";
import { Button, Select, Table, TextField } from "@chanho/react";
import type { TableColumn } from "@chanho/react";
import { useOrgClient } from "../context";
import { useAsync } from "../useAsync";
import { DataSection } from "../components/DataSection";
import { Pagination } from "../components/Pagination";
import { JOINED_VIA_LABEL, MEMBER_KIND_LABEL, MEMBER_STATUS_LABEL, formatDate } from "../format";
import { MemberStatusLozenge } from "./StatusLozenge";
import { UserDetailDrawer } from "./UserDetailDrawer";
import type { Member, MemberKind, MemberStatus } from "../api/types";
import styles from "./screen.module.css";

const PAGE_SIZE = 20;
const ALL = "ALL";

const STATUS_OPTIONS = [
  { value: ALL, label: "전체 상태" },
  ...(["ACTIVE", "PENDING", "SUSPENDED", "DEACTIVATED"] as const).map((s) => ({
    value: s,
    label: MEMBER_STATUS_LABEL[s],
  })),
];

const KIND_OPTIONS = [
  { value: ALL, label: "전체 종류" },
  ...(["HUMAN", "AGENT"] as const).map((k) => ({ value: k, label: MEMBER_KIND_LABEL[k] })),
];

/** 사용자 목록 — 검색·상태/종류 필터·페이지네이션, 행을 열면 상세. */
export function UsersScreen() {
  const client = useOrgClient();
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState<MemberStatus | typeof ALL>("ACTIVE");
  const [kind, setKind] = useState<MemberKind | typeof ALL>("HUMAN");
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  const result = useAsync(
    () =>
      client.memberPage({
        q: term,
        status: status === ALL ? "" : status,
        kind: kind === ALL ? "" : kind,
        page,
        size: PAGE_SIZE,
      }),
    [client, term, status, kind, page],
  );

  const columns = useMemo<TableColumn<Member>[]>(
    () => [
      { key: "displayName", header: "이름" },
      { key: "email", header: "이메일", render: (row) => row.email ?? "-" },
      {
        key: "status",
        header: "상태",
        render: (row) => <MemberStatusLozenge status={row.status} />,
      },
      { key: "kind", header: "종류", render: (row) => MEMBER_KIND_LABEL[row.kind] },
      {
        key: "joinedVia",
        header: "가입 경로",
        render: (row) => (row.joinedVia ? JOINED_VIA_LABEL[row.joinedVia] : "-"),
      },
      { key: "createdAt", header: "등록일", render: (row) => formatDate(row.createdAt) },
      {
        key: "actions",
        header: "",
        adjustable: false,
        render: (row) => (
          <Button variant="subtle" size="small" onClick={() => setOpenId(row.id)}>
            상세
          </Button>
        ),
      },
    ],
    [],
  );

  const items = result.data?.items ?? [];

  return (
    <div className={styles.screen}>
      <div className={styles.toolbar}>
        <TextField
          className={styles.toolbarGrow}
          label="사용자 검색"
          placeholder="이름 또는 이메일"
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            setPage(0);
          }}
        />
        <Select
          label="상태"
          options={STATUS_OPTIONS}
          value={status}
          onValueChange={(next) => {
            setStatus(next as MemberStatus | typeof ALL);
            setPage(0);
          }}
        />
        <Select
          label="종류"
          options={KIND_OPTIONS}
          value={kind}
          onValueChange={(next) => {
            setKind(next as MemberKind | typeof ALL);
            setPage(0);
          }}
        />
      </div>

      <DataSection
        loading={result.loading}
        error={result.error}
        empty={items.length === 0}
        emptyTitle="조건에 맞는 사용자가 없습니다"
        emptyDescription="검색어나 필터를 바꿔 보세요."
        onRetry={result.reload}
      >
        <Table aria-label="사용자 목록" columns={columns} rows={items} />
        <Pagination
          page={result.data?.page ?? 0}
          size={result.data?.size ?? PAGE_SIZE}
          total={result.data?.total ?? 0}
          onPageChange={setPage}
        />
      </DataSection>

      {openId ? (
        <UserDetailDrawer
          memberId={openId}
          onClose={() => setOpenId(null)}
          onChanged={result.reload}
        />
      ) : null}
    </div>
  );
}

import { useMemo, useState } from "react";
import { Button, Select, Table, TextField, useToast } from "@chanho/react";
import type { TableColumn } from "@chanho/react";
import { useOrgAdmin } from "../context";
import { downloadBlob, todayStamp } from "../download";
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

/** 사용자 목록 — 검색·상태/종류 필터·페이지네이션, 행을 열면 상세. 전역 관리자는 현재 필터로 CSV를 내려받는다. */
export function UsersScreen() {
  const { client, isGlobalAdmin } = useOrgAdmin();
  const toast = useToast();
  const [exporting, setExporting] = useState(false);
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState<MemberStatus | typeof ALL>("ACTIVE");
  const [kind, setKind] = useState<MemberKind | typeof ALL>("HUMAN");
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  const result = useAsync(
    () =>
      client.memberPage({
        q: term,
        // "전체"는 ALL로 명시한다 — 비워 보내면 서버 기본값(ACTIVE·HUMAN)으로 걸러져 "전체"가 활성만 보였다.
        status,
        kind,
        page,
        size: PAGE_SIZE,
      }),
    [client, term, status, kind, page],
  );

  const columns = useMemo<TableColumn<Member>[]>(
    () => [
      { key: "displayName", header: "이름", render: (row) => <span className={styles.personName}>{row.displayName}</span> },
      { key: "email", header: "이메일", render: (row) => <span className={styles.breakAnywhere}>{row.email ?? "-"}</span> },
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

  /** 지금 화면의 필터(검색어·상태·종류) 그대로 — 페이지와 무관하게 조건에 맞는 전원을 받는다. */
  const exportCsv = () => {
    setExporting(true);
    client.exportMembersCsv({ q: term, status, kind }).then(
      (blob) => {
        setExporting(false);
        downloadBlob(blob, `members-${todayStamp()}.csv`);
      },
      (cause: unknown) => {
        setExporting(false);
        toast({
          title: cause instanceof Error ? cause.message : "CSV를 내려받지 못했습니다",
          appearance: "danger",
        });
      },
    );
  };

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
        {isGlobalAdmin ? (
          <div className={styles.toolbarEnd}>
            <Button variant="secondary" loading={exporting} onClick={exportCsv}>
              CSV 내보내기
            </Button>
          </div>
        ) : null}
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

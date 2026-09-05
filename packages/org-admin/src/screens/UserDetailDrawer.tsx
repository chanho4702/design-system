import { useState } from "react";
import { Button, ConfirmDialog, Modal, Spinner, Tag, useToast } from "@chanho/react";
import { useOrgAdmin } from "../context";
import { useAsync } from "../useAsync";
import {
  GRANT_ROLE_LABEL,
  JOINED_VIA_LABEL,
  MEMBER_KIND_LABEL,
  formatDate,
  formatDateTime,
  memberEventLabel,
} from "../format";
import { ResourceName } from "../components/ResourceName";
import { MemberStatusLozenge } from "./StatusLozenge";
import type { MemberStatus } from "../api/types";
import styles from "./screen.module.css";

export interface UserDetailDrawerProps {
  memberId: string;
  onClose: () => void;
  /** 상태를 바꾼 뒤 목록을 다시 읽게 한다. */
  onChanged: () => void;
}

/**
 * 사용자 상세 — 기본 정보·상태 전이·팀·권한·이력.
 * 비활성화는 되돌리려면 재초대가 필요하므로 확인 다이얼로그를 거친다(§3.2 상태 전이).
 */
export function UserDetailDrawer({ memberId, onClose, onChanged }: UserDetailDrawerProps) {
  const { client, currentUser, isGlobalAdmin } = useOrgAdmin();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const detail = useAsync(() => client.member(memberId), [client, memberId]);
  const events = useAsync(
    () => (isGlobalAdmin ? client.memberEvents(memberId) : Promise.resolve([])),
    [client, memberId, isGlobalAdmin],
  );

  const isSelf = currentUser.id === memberId;

  const changeStatus = (status: MemberStatus) => {
    setBusy(true);
    client.patchMember(memberId, { status }).then(
      () => {
        setBusy(false);
        setConfirmDeactivate(false);
        toast({ title: "상태를 변경했습니다", appearance: "success" });
        detail.reload();
        events.reload();
        onChanged();
      },
      (cause: unknown) => {
        setBusy(false);
        setConfirmDeactivate(false);
        toast({
          title: cause instanceof Error ? cause.message : "상태를 변경하지 못했습니다",
          appearance: "danger",
        });
      },
    );
  };

  const member = detail.data;

  return (
    <Modal open onOpenChange={(open) => (open ? undefined : onClose())} title="사용자 상세">
      {detail.loading ? <Spinner size="large" label="불러오는 중" /> : null}
      {detail.error ? (
        <p role="alert" className={styles.subtle}>
          {detail.error}
        </p>
      ) : null}
      {member ? (
        <div className={styles.stack}>
          <dl className={styles.detailList}>
            <dt>이름</dt>
            <dd>{member.displayName}</dd>
            <dt>이메일</dt>
            <dd>{member.email ?? "-"}</dd>
            <dt>상태</dt>
            <dd>
              <MemberStatusLozenge status={member.status} />
            </dd>
            <dt>종류</dt>
            <dd>{MEMBER_KIND_LABEL[member.kind]}</dd>
            <dt>가입 경로</dt>
            <dd>{member.joinedVia ? JOINED_VIA_LABEL[member.joinedVia] : "-"}</dd>
            <dt>등록일</dt>
            <dd>{formatDate(member.createdAt)}</dd>
          </dl>

          {isGlobalAdmin ? (
            <div className={styles.rowActions}>
              {member.status === "ACTIVE" ? (
                <Button
                  variant="secondary"
                  loading={busy}
                  onClick={() => changeStatus("SUSPENDED")}
                >
                  일시 정지
                </Button>
              ) : null}
              {member.status === "SUSPENDED" || member.status === "PENDING" ? (
                <Button variant="secondary" loading={busy} onClick={() => changeStatus("ACTIVE")}>
                  활성화
                </Button>
              ) : null}
              {member.status !== "DEACTIVATED" ? (
                <Button
                  variant="danger"
                  disabled={isSelf}
                  onClick={() => setConfirmDeactivate(true)}
                >
                  비활성화
                </Button>
              ) : null}
              {isSelf ? <p className={styles.subtle}>본인 계정은 비활성화할 수 없습니다.</p> : null}
            </div>
          ) : null}

          <section className={styles.stack}>
            <h3 className={styles.sectionTitle}>팀</h3>
            {member.teams.length === 0 ? (
              <p className={styles.subtle}>소속된 팀이 없습니다.</p>
            ) : (
              <div className={styles.chips}>
                {member.teams.map((team) => (
                  <Tag
                    key={team.id}
                    label={`${team.name}${team.role === "LEAD" ? " · 리더" : ""}`}
                  />
                ))}
              </div>
            )}
          </section>

          <section className={styles.stack}>
            <h3 className={styles.sectionTitle}>권한</h3>
            {member.grants.length === 0 ? (
              <p className={styles.subtle}>직접 부여된 권한이 없습니다.</p>
            ) : (
              <ul className={styles.eventList}>
                {member.grants.map((grant) => (
                  <li key={grant.id} className={styles.eventRow}>
                    <span className={styles.eventType}>
                      <ResourceName scope={grant.scope} resourceId={grant.resourceId} />
                    </span>
                    <span>{GRANT_ROLE_LABEL[grant.role]}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {isGlobalAdmin ? (
            <section className={styles.stack}>
              <h3 className={styles.sectionTitle}>이력</h3>
              {events.loading ? <Spinner size="small" label="이력 불러오는 중" /> : null}
              {events.error ? (
                <p className={styles.subtle} role="alert">
                  {events.error}
                </p>
              ) : null}
              {!events.loading && !events.error && (events.data?.length ?? 0) === 0 ? (
                <p className={styles.subtle}>기록된 이력이 없습니다.</p>
              ) : null}
              {events.data && events.data.length > 0 ? (
                <ul className={styles.eventList}>
                  {events.data.map((event) => (
                    <li key={event.id} className={styles.eventRow}>
                      <span className={styles.eventType}>{memberEventLabel(event.type)}</span>
                      <span>{formatDateTime(event.createdAt)}</span>
                      {event.detail ? <span>{event.detail}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmDeactivate}
        onOpenChange={setConfirmDeactivate}
        title="사용자를 비활성화합니다"
        description="비활성화하면 로그인과 모든 권한이 막힙니다. 되돌리려면 다시 초대해야 합니다."
        confirmLabel="비활성화"
        danger
        loading={busy}
        onConfirm={() => changeStatus("DEACTIVATED")}
      />
    </Modal>
  );
}

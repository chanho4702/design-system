import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
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

/** org-service `AvatarService`와 같은 제한 — 서버가 최종 판정하고, 화면은 명백한 것만 먼저 거른다. */
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"];

/** 서버 400 문구와 같게 맞춘다 — 어디서 걸러지든 관리자가 보는 말이 같도록. */
function avatarPrecheck(file: File): string | null {
  if (file.size === 0) return "빈 파일은 올릴 수 없습니다";
  if (file.size > AVATAR_MAX_BYTES) return "아바타는 2MB 이하 이미지여야 합니다";
  if (file.type !== "" && !AVATAR_TYPES.includes(file.type)) {
    return "아바타는 PNG·JPG·WebP 이미지만 올릴 수 있습니다";
  }
  return null;
}

/**
 * 사용자 상세 — 기본 정보·상태 전이·아바타(전역 관리자)·팀·권한·이력.
 * 비활성화는 되돌리려면 재초대가 필요하므로 확인 다이얼로그를 거친다(§3.2 상태 전이).
 */
export function UserDetailDrawer({ memberId, onClose, onChanged }: UserDetailDrawerProps) {
  const { client, currentUser, isGlobalAdmin } = useOrgAdmin();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [confirmAvatarRemove, setConfirmAvatarRemove] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

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

  const failToast = (cause: unknown, fallback: string) =>
    toast({ title: cause instanceof Error ? cause.message : fallback, appearance: "danger" });

  /** 아바타가 바뀌면 이력(AVATAR_*)과 목록(얼굴)이 함께 달라진다. */
  const afterAvatarChange = (title: string) => {
    toast({ title, appearance: "success" });
    events.reload();
    onChanged();
  };

  const uploadAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    // 같은 파일을 다시 골라도 change가 오도록 비운다.
    input.value = "";
    if (!file) return;
    const problem = avatarPrecheck(file);
    if (problem) {
      toast({ title: problem, appearance: "danger" });
      return;
    }
    setAvatarBusy(true);
    client.uploadMemberAvatar(memberId, file).then(
      () => {
        setAvatarBusy(false);
        afterAvatarChange("아바타를 변경했습니다");
      },
      (cause: unknown) => {
        setAvatarBusy(false);
        failToast(cause, "아바타를 변경하지 못했습니다");
      },
    );
  };

  const removeAvatar = () => {
    setAvatarBusy(true);
    client.removeMemberAvatar(memberId).then(
      () => {
        setAvatarBusy(false);
        setConfirmAvatarRemove(false);
        afterAvatarChange("아바타를 삭제했습니다");
      },
      (cause: unknown) => {
        setAvatarBusy(false);
        setConfirmAvatarRemove(false);
        failToast(cause, "아바타를 삭제하지 못했습니다");
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

          {isGlobalAdmin ? (
            <section className={styles.stack}>
              <h3 className={styles.sectionTitle}>아바타</h3>
              <p className={styles.subtle}>
                PNG·JPG·WebP, 2MB 이하. 브라우저로 로그인하지 않는 에이전트 계정의 얼굴은 여기서만
                넣을 수 있습니다.
              </p>
              <div className={styles.rowActions}>
                <input
                  ref={fileInput}
                  type="file"
                  accept={AVATAR_TYPES.join(",")}
                  aria-label="아바타 이미지 파일"
                  tabIndex={-1}
                  className={styles.visuallyHidden}
                  onChange={uploadAvatar}
                />
                <Button
                  variant="secondary"
                  loading={avatarBusy}
                  onClick={() => fileInput.current?.click()}
                >
                  아바타 변경
                </Button>
                <Button
                  variant="subtle"
                  disabled={avatarBusy}
                  onClick={() => setConfirmAvatarRemove(true)}
                >
                  아바타 삭제
                </Button>
              </div>
            </section>
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

      <ConfirmDialog
        open={confirmAvatarRemove}
        onOpenChange={setConfirmAvatarRemove}
        title="아바타를 삭제합니다"
        description="이 사용자의 아바타 이미지를 지웁니다. 필요하면 다시 올릴 수 있습니다."
        confirmLabel="삭제"
        danger
        loading={avatarBusy}
        onConfirm={removeAvatar}
      />
    </Modal>
  );
}

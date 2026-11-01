import { Modal, SkeletonText } from "@chanho/react";
import { useOrgClient } from "../context";
import { useAsync } from "../useAsync";
import { formatDateTime, memberEventLabel } from "../format";
import type { Invitation } from "../api/types";
import styles from "./screen.module.css";

export interface InvitationHistoryDialogProps {
  invitation: Invitation;
  onClose: () => void;
}

/**
 * 초대 한 건의 이력 — 발송·재발송·철회·만료·수락이 최신순으로(F-25).
 * 서버 상한은 100건이고, 수락 뒤의 일(승인·정지 등)은 사용자 상세의 이력에 남는다.
 */
export function InvitationHistoryDialog({ invitation, onClose }: InvitationHistoryDialogProps) {
  const client = useOrgClient();
  const events = useAsync(() => client.invitationEvents(invitation.id), [client, invitation.id]);
  const items = events.data ?? [];

  return (
    <Modal
      open
      onOpenChange={(open) => (open ? undefined : onClose())}
      title={`초대 이력 — ${invitation.email}`}
    >
      <div className={styles.stack}>
        {events.loading ? <SkeletonText lines={3} label="이력 불러오는 중" /> : null}
        {events.error ? (
          <p className={styles.subtle} role="alert">
            {events.error}
          </p>
        ) : null}
        {!events.loading && !events.error && items.length === 0 ? (
          <p className={styles.subtle}>기록된 이력이 없습니다.</p>
        ) : null}
        {items.length > 0 ? (
          <ul className={styles.eventList} aria-label="초대 이력">
            {items.map((event) => (
              <li key={event.id} className={styles.eventRow}>
                <span className={styles.eventType}>{memberEventLabel(event.type)}</span>
                <span>{formatDateTime(event.createdAt)}</span>
                {event.detail ? <span className={styles.breakAnywhere}>{event.detail}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Modal>
  );
}

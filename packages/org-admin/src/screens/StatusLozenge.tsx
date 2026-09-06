import { Lozenge } from "@chanho/react";
import { INVITATION_STATUS_LABEL, MAIL_STATUS_LABEL, MEMBER_STATUS_LABEL } from "../format";
import type { InvitationStatus, MailOutboxStatus, MemberStatus } from "../api/types";

const MEMBER_APPEARANCE: Record<MemberStatus, "neutral" | "info" | "success" | "warning" | "danger"> =
  {
    PENDING: "warning",
    ACTIVE: "success",
    SUSPENDED: "info",
    DEACTIVATED: "neutral",
  };

const INVITATION_APPEARANCE: Record<
  InvitationStatus,
  "neutral" | "info" | "success" | "warning" | "danger"
> = {
  PENDING: "info",
  ACCEPTED: "success",
  EXPIRED: "warning",
  REVOKED: "neutral",
};

export function MemberStatusLozenge({ status }: { status: MemberStatus }) {
  return <Lozenge appearance={MEMBER_APPEARANCE[status]}>{MEMBER_STATUS_LABEL[status]}</Lozenge>;
}

export function InvitationStatusLozenge({ status }: { status: InvitationStatus }) {
  return (
    <Lozenge appearance={INVITATION_APPEARANCE[status]}>
      {INVITATION_STATUS_LABEL[status]}
    </Lozenge>
  );
}

const MAIL_APPEARANCE: Record<
  MailOutboxStatus,
  "neutral" | "info" | "success" | "warning" | "danger"
> = {
  PENDING: "warning",
  SENT: "success",
  FAILED: "danger",
};

export function MailStatusLozenge({ status }: { status: MailOutboxStatus }) {
  return <Lozenge appearance={MAIL_APPEARANCE[status]}>{MAIL_STATUS_LABEL[status]}</Lozenge>;
}

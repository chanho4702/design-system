import { Link } from "react-router";
import { useOrgAdmin } from "../context";
import { mailPath } from "../paths";
import styles from "./MailLogLink.module.css";

export interface MailLogLinkProps {
  /** 링크 문구. 기본은 "발송 로그 보기". */
  label?: string;
}

/**
 * 메일 설정 화면의 발송 로그로 보내는 링크. 초대는 메일을 직접 보내지 않고 발송 대기열
 * (org-service outbox)에 넣기만 하므로, 실제 발송 결과를 볼 수 있는 곳을 같이 가리킨다.
 *
 * 메일 설정은 전역 관리자 전용 화면이다(서버도 같은 권한으로 막는다) — 권한이 없으면
 * 링크를 아예 렌더하지 않는다. 막힌 화면으로 보내는 링크를 주지 않기 위해서다.
 */
export function MailLogLink({ label = "발송 로그 보기" }: MailLogLinkProps) {
  const { basePath, isGlobalAdmin } = useOrgAdmin();
  if (!isGlobalAdmin) return null;
  return (
    <Link className={styles.link} to={mailPath(basePath)}>
      {label}
    </Link>
  );
}

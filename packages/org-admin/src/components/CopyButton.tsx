import { useState } from "react";
import { Button, useToast } from "@chanho/react";
import { Check, Copy } from "lucide-react";

export interface CopyButtonProps {
  value: string;
  /** 버튼 라벨. 아이콘 전용이면 `iconOnly`와 함께 접근 가능 이름으로 쓰인다. */
  label: string;
  iconOnly?: boolean;
}

async function writeClipboard(value: string): Promise<void> {
  const clipboard = navigator.clipboard;
  if (clipboard && typeof clipboard.writeText === "function") {
    await clipboard.writeText(value);
    return;
  }
  // 클립보드 API가 없는 환경(비 https 등)에서는 임시 입력으로 복사한다.
  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  const ok = typeof document.execCommand === "function" && document.execCommand("copy");
  document.body.removeChild(field);
  if (!ok) throw new Error("클립보드에 복사하지 못했습니다");
}

/** 초대 링크처럼 "화면에서 복사해 전달"하는 값 전용 버튼. */
export function CopyButton({ value, label, iconOnly = false }: CopyButtonProps) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const copy = () => {
    writeClipboard(value).then(
      () => {
        setCopied(true);
        toast({ title: "링크를 복사했습니다", appearance: "success" });
        window.setTimeout(() => setCopied(false), 2000);
      },
      (cause: unknown) => {
        toast({
          title: cause instanceof Error ? cause.message : "복사하지 못했습니다",
          appearance: "danger",
        });
      },
    );
  };

  return (
    <Button
      variant="secondary"
      size="small"
      iconOnly={iconOnly}
      aria-label={iconOnly ? label : undefined}
      iconBefore={copied ? <Check size={14} /> : <Copy size={14} />}
      onClick={copy}
    >
      {iconOnly ? null : label}
    </Button>
  );
}

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { Button } from "../Button/Button";
import { CommandPalette } from "./CommandPalette";
import type { CommandItem } from "./CommandPalette";

function Dot({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <circle cx="7" cy="7" r="5" fill={color} />
    </svg>
  );
}

const ITEMS: CommandItem[] = [
  { id: "create", label: "이슈 만들기", group: "이슈", shortcut: "C" },
  {
    id: "status",
    label: "상태 변경",
    group: "이슈",
    placeholder: "상태 검색…",
    items: [
      { id: "todo", label: "할 일", icon: <Dot color="var(--chanho-color-text-subtle)" /> },
      { id: "doing", label: "진행 중", icon: <Dot color="var(--chanho-color-text-info)" /> },
      { id: "done", label: "완료", icon: <Dot color="var(--chanho-color-text-success)" /> },
    ],
  },
  { id: "assign", label: "나에게 할당", group: "이슈", shortcut: "I" },
  { id: "inbox", label: "받은 편지함으로 이동", group: "이동", shortcut: ["G", "I"], keywords: ["inbox"] },
  { id: "board", label: "보드로 이동", group: "이동", shortcut: ["G", "B"] },
  { id: "issue", label: "PLAT-128 로그인 리다이렉트 오류", description: "플랫폼 · 진행 중", group: "최근 이슈" },
  { id: "archived", label: "보관함", group: "이동", disabled: true },
];

/** ⌘K/Ctrl+K 바인딩은 소비 앱 몫 — 스토리에서는 예시로 붙인다. */
function Demo({ loading = false }: { loading?: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        명령 팔레트 열기 (⌘K)
      </Button>
      <CommandPalette open={open} onOpenChange={setOpen} items={ITEMS} loading={loading} />
    </>
  );
}

const meta = {
  title: "Components/CommandPalette",
  component: CommandPalette,
  parameters: {
    docs: {
      description: {
        component:
          "리니어식 명령 팔레트. 열기 단축키는 소비 앱이 붙이고 컴포넌트는 open/onOpenChange로 제어한다. " +
          "↑↓·Home·End 이동, Enter 실행, 하위 페이지(→ 표시)는 Enter로 들어가고 Esc/Backspace로 돌아온다.",
      },
    },
  },
  args: { open: false, onOpenChange: () => {}, items: ITEMS },
} satisfies Meta<typeof CommandPalette>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <Demo /> };

export const Loading: Story = { render: () => <Demo loading /> };

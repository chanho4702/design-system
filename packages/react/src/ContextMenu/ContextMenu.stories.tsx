import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContextMenu } from "./ContextMenu";

const meta = {
  title: "Components/ContextMenu",
  component: ContextMenu,
  parameters: {
    docs: {
      description: {
        component:
          "우클릭 메뉴(Radix ContextMenu). 영역에 포커스를 두고 Shift+F10 또는 메뉴 키로도 연다. " +
          "시각은 Dropdown과 같고, 하위 메뉴·체크 항목·단축키 힌트(표시 전용)·위험 항목을 지원한다.",
      },
    },
  },
} satisfies Meta<typeof ContextMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const IssueRow: Story = {
  name: "이슈 행",
  args: {
    items: [
      { label: "열기", shortcut: "Enter" },
      { label: "링크 복사", shortcut: "⌘C" },
      { separator: true },
      {
        label: "상태 변경",
        items: [
          { label: "할 일" },
          { label: "진행 중" },
          { label: "완료" },
        ],
      },
      {
        label: "담당자",
        items: [{ label: "나에게 할당" }, { label: "할당 해제" }],
      },
      { label: "하위 항목 보기", checked: true },
      { separator: true },
      { label: "삭제", danger: true, shortcut: "Del" },
    ],
    children: (
      <div
        tabIndex={0}
        style={{
          padding: 24,
          border: "1px dashed var(--chanho-color-border-default)",
          borderRadius: 6,
          width: 360,
        }}
      >
        PLAT-128 로그인 리다이렉트 오류 — 여기를 우클릭(또는 포커스 후 Shift+F10)
      </div>
    ),
  },
};

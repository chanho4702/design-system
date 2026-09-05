import type { Meta, StoryObj } from "@storybook/react-vite";
import { Lozenge } from "../Lozenge/Lozenge";
import { Tabs } from "./Tabs";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "이슈 상세",
    items: [
      { value: "overview", label: "개요", content: <p>개요 내용입니다.</p> },
      { value: "settings", label: "설정", content: <p>설정 내용입니다.</p> },
      { value: "activity", label: "활동", content: <p>활동 내용입니다.</p> },
    ],
  },
};

/**
 * label은 ReactNode라 아이콘·배지를 넣을 수 있다.
 * 노드를 쓰면 스크린리더가 읽을 이름은 ariaLabel로 문자열로 고정한다
 * (ALM 필드 구성의 "버그 (덮어씀)" 탭).
 */
export const NodeLabels: Story = {
  args: {
    label: "필드 구성",
    items: [
      {
        value: "bug",
        label: (
          <>
            버그{" "}
            <Lozenge appearance="info" aria-hidden="true">
              덮어씀
            </Lozenge>
          </>
        ),
        ariaLabel: "버그 (덮어씀)",
        content: <p>버그 타입만 덮어쓴 필드 구성입니다.</p>,
      },
      { value: "task", label: "작업", content: <p>작업 필드 구성입니다.</p> },
      { value: "story", label: "스토리", content: <p>스토리 필드 구성입니다.</p> },
    ],
  },
};

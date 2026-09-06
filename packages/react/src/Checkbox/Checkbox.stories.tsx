import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./Checkbox";

/** 스토리용 아이콘 — 라벨이 ReactNode라 아이콘+텍스트를 넣을 수 있다. */
function BellIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1.5a3.5 3.5 0 0 0-3.5 3.5v3L2 9.5h10L10.5 8V5A3.5 3.5 0 0 0 7 1.5ZM5.5 11a1.5 1.5 0 0 0 3 0"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  args: { label: "동의합니다" },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const Disabled: Story = { args: { disabled: true } };

export const DisabledChecked: Story = { args: { disabled: true, defaultChecked: true } };

/** 표 헤더·행처럼 글자를 둘 자리가 없을 때 — 라벨은 스크린리더에만 남는다. */
export const LabelHidden: Story = {
  args: { label: "모두 선택", labelHidden: true },
};

/** 일부만 선택된 상태 — "모두 선택" 헤더 체크박스가 이 모습이 된다. */
export const Indeterminate: Story = {
  args: { label: "모두 선택", checked: "indeterminate" },
};

/** 라벨은 ReactNode라 아이콘·배지를 넣을 수 있다. 접근 이름은 라벨 안 텍스트로 남는다. */
export const NodeLabel: Story = {
  args: {
    label: (
      <>
        <BellIcon /> 알림 받기
      </>
    ),
  },
};

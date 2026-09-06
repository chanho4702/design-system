import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "./Switch";

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
  title: "Components/Switch",
  component: Switch,
  args: { label: "알림 받기" },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const On: Story = { args: { defaultChecked: true } };

export const Disabled: Story = { args: { disabled: true } };

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

import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./Checkbox";

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

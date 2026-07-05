import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./Select";

const OPTIONS = [
  { value: "high", label: "높음" },
  { value: "medium", label: "보통" },
  { value: "low", label: "낮음" },
];

const meta = {
  title: "Components/Select",
  component: Select,
  args: { label: "우선순위", options: OPTIONS, placeholder: "선택하세요" },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Preselected: Story = { args: { defaultValue: "medium" } };

export const Disabled: Story = { args: { disabled: true } };

import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProgressBar } from "./ProgressBar";

const meta = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  args: { label: "업로드 진행률", value: 60 },
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Success: Story = { args: { variant: "success", value: 100 } };

export const Danger: Story = { args: { variant: "danger", value: 30 } };

export const Indeterminate: Story = { args: { indeterminate: true } };

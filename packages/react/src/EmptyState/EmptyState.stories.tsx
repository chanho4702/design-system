import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyState } from "./EmptyState";

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  args: { title: "아직 항목이 없습니다" },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: { description: "새 항목을 추가하면 여기에 표시됩니다." },
};

export const WithActions: Story = {
  args: {
    description: "새 항목을 추가하면 여기에 표시됩니다.",
    primaryAction: { label: "항목 추가", onClick: () => {} },
    secondaryAction: { label: "가이드 보기", onClick: () => {} },
  },
};

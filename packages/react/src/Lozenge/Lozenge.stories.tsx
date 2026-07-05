import type { Meta, StoryObj } from "@storybook/react-vite";
import { Lozenge } from "./Lozenge";

const meta = {
  title: "Components/Lozenge",
  component: Lozenge,
} satisfies Meta<typeof Lozenge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Neutral: Story = { args: { children: "할 일" } };

export const Info: Story = { args: { appearance: "info", children: "진행 중" } };

export const Success: Story = { args: { appearance: "success", children: "완료" } };

export const Warning: Story = { args: { appearance: "warning", children: "검토 필요" } };

export const Danger: Story = { args: { appearance: "danger", children: "차단됨" } };

import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { Tooltip } from "./Tooltip";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: "보관된 항목은 삭제할 수 없습니다",
    children: <Button variant="subtle">삭제</Button>,
  },
};

export const Bottom: Story = {
  args: {
    content: "아래쪽에 표시",
    side: "bottom",
    children: <Button variant="subtle">아래</Button>,
  },
};

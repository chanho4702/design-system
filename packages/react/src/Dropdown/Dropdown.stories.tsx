import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { Dropdown } from "./Dropdown";

const meta = {
  title: "Components/Dropdown",
  component: Dropdown,
} satisfies Meta<typeof Dropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: <Button variant="subtle">더보기</Button>,
    items: [
      { label: "수정" },
      { label: "복제" },
      { label: "보관", disabled: true },
      { label: "삭제", danger: true },
    ],
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
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

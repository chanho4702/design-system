import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { InlineEdit } from "./InlineEdit";
import type { InlineEditProps } from "./InlineEdit";

const meta = {
  title: "Components/InlineEdit",
  component: InlineEdit,
  args: { label: "제목", value: "스프린트 계획 회의", onSave: () => {} },
} satisfies Meta<typeof InlineEdit>;

export default meta;

type Story = StoryObj<typeof meta>;

function Controlled(args: InlineEditProps) {
  const [value, setValue] = useState(args.value);
  return <InlineEdit {...args} value={value} onSave={setValue} />;
}

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
};

export const Empty: Story = {
  render: (args) => <Controlled {...args} />,
  args: { value: "", placeholder: "제목을 입력하세요" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

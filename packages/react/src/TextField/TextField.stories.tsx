import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextField } from "./TextField";

const meta = {
  title: "Components/TextField",
  component: TextField,
  args: { label: "이메일" },
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: { description: "회사 이메일을 입력하세요" },
};

export const WithError: Story = {
  args: { error: "필수 항목입니다" },
};

export const Disabled: Story = { args: { disabled: true } };

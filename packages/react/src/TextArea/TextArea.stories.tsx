import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextArea } from "./TextArea";

const meta = {
  title: "Components/TextArea",
  component: TextArea,
  args: { label: "설명" },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDescription: Story = {
  args: { description: "이슈의 배경과 재현 방법을 적어주세요." },
};
export const WithError: Story = { args: { error: "필수 항목입니다" } };
export const Disabled: Story = { args: { disabled: true } };

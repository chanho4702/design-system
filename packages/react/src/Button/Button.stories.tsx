import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  args: { children: "버튼" },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Subtle: Story = { args: { variant: "subtle" } };

export const Danger: Story = { args: { variant: "danger" } };

export const Small: Story = { args: { size: "small" } };

export const Disabled: Story = { args: { disabled: true } };

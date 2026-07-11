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

export const Secondary: Story = { args: { variant: "secondary" } };

export const Subtle: Story = { args: { variant: "subtle" } };

export const Danger: Story = { args: { variant: "danger" } };

export const Ghost: Story = { args: { variant: "ghost" } };

export const Small: Story = { args: { size: "small" } };

export const Large: Story = { args: { size: "large" } };

export const Loading: Story = { args: { loading: true } };

export const WithIcon: Story = {
  args: { iconBefore: <span aria-hidden="true">+</span>, children: "추가" },
};

export const FullWidth: Story = { args: { fullWidth: true } };

export const Disabled: Story = { args: { disabled: true } };

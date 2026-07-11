import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tag } from "./Tag";

const meta = {
  title: "Components/Tag",
  component: Tag,
  args: { label: "디자인 시스템" },
} satisfies Meta<typeof Tag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Link: Story = { args: { href: "#" } };

export const Removable: Story = { args: { onRemove: () => {} } };

export const LinkRemovable: Story = { args: { href: "#", onRemove: () => {} } };

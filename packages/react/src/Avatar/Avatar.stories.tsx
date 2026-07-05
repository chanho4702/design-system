import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "./Avatar";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  args: { name: "김찬호" },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Initials: Story = {};

export const EnglishName: Story = { args: { name: "chanho kim" } };

export const WithImage: Story = {
  args: { src: "https://api.dicebear.com/9.x/identicon/svg?seed=chanho" },
};

export const Small: Story = { args: { size: "small" } };

export const Large: Story = { args: { size: "large" } };

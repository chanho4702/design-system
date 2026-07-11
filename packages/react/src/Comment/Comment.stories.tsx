import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "../Avatar/Avatar";
import { Comment } from "./Comment";

const meta = {
  title: "Components/Comment",
  component: Comment,
  args: {
    author: "김찬호",
    avatar: <Avatar name="김찬호" />,
    time: "3시간 전",
    children: "이 부분은 다음 스프린트에서 다루는 게 좋겠어요.",
  },
} satisfies Meta<typeof Comment>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActions: Story = {
  args: {
    actions: [
      { label: "답글", onClick: () => {} },
      { label: "편집", onClick: () => {} },
      { label: "삭제", onClick: () => {}, danger: true },
    ],
  },
};

export const Nested: Story = {
  args: {
    nested: true,
    author: "이수민",
    avatar: <Avatar name="이수민" />,
    time: "1시간 전",
    children: "동의합니다. 우선순위를 낮추죠.",
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card";

const meta = {
  title: "Components/Card",
  component: Card,
  args: { children: "카드 본문 내용입니다." },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHeader: Story = {
  args: { title: "프로젝트 요약" },
};

export const WithHeaderActions: Story = {
  args: {
    title: "프로젝트 요약",
    headerActions: <button type="button">더보기</button>,
  },
};

export const Interactive: Story = {
  args: { interactive: true, title: "클릭 가능한 카드" },
};

export const PaddingLarge: Story = {
  args: { padding: "lg", title: "넓은 여백" },
};

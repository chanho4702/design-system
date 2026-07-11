import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageHeader } from "./PageHeader";

const meta = {
  title: "Components/PageHeader",
  component: PageHeader,
  args: { title: "프로젝트 대시보드" },
} satisfies Meta<typeof PageHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithBreadcrumbs: Story = {
  args: {
    breadcrumbs: [
      { label: "홈", href: "#" },
      { label: "프로젝트", href: "#" },
      { label: "대시보드" },
    ],
  },
};

export const WithActions: Story = {
  args: {
    actions: (
      <button type="button" onClick={() => {}}>
        새로 만들기
      </button>
    ),
  },
};

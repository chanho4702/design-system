import type { Meta, StoryObj } from "@storybook/react-vite";
import { Banner } from "./Banner";

const meta = {
  title: "Components/Banner",
  component: Banner,
  args: { children: "새 버전이 배포되었습니다." },
} satisfies Meta<typeof Banner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Info: Story = {};

export const Warning: Story = {
  args: { variant: "warning", children: "저장하지 않은 변경사항이 있습니다." },
};

export const Danger: Story = {
  args: { variant: "danger", children: "동기화에 실패했습니다." },
};

export const WithAction: Story = {
  args: { action: { label: "새로고침", onClick: () => {} } },
};

export const Dismissible: Story = {
  args: { onDismiss: () => {} },
};

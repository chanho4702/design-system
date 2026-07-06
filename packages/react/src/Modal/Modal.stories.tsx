import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { Modal } from "./Modal";

const meta = {
  title: "Components/Modal",
  component: Modal,
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: <Button>이슈 삭제</Button>,
    title: "이슈 삭제",
    description: "이 작업은 되돌릴 수 없습니다.",
    children: (
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button variant="subtle">취소</Button>
        <Button variant="danger">삭제</Button>
      </div>
    ),
  },
};

export const WithoutDescription: Story = {
  args: {
    trigger: <Button variant="subtle">설정</Button>,
    title: "설정",
    children: <p>설정 내용이 들어갑니다.</p>,
  },
};

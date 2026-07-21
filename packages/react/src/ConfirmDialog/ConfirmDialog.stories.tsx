import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { ConfirmDialog } from "./ConfirmDialog";

const meta = {
  title: "Components/ConfirmDialog",
  component: ConfirmDialog,
  // 필수 props 기본값 — 각 스토리의 render가 실제 동작을 덮는다.
  args: { open: false, onOpenChange: () => {}, title: "페이지 삭제", onConfirm: () => {} },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DeleteConfirm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>
          페이지 삭제
        </Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="페이지 삭제"
          description="이 페이지와 하위 페이지가 삭제됩니다. 이 작업은 되돌릴 수 없습니다."
          confirmLabel="삭제"
          cancelLabel="취소"
          danger
          onConfirm={() => setOpen(false)}
        />
      </>
    );
  },
};

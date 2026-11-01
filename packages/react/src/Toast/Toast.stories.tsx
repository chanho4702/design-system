import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { ToastProvider, useToast } from "./Toast";

function Demo() {
  const toast = useToast();
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Button
        variant="subtle"
        onClick={() => toast({ title: "저장됨", description: "변경 사항이 저장되었습니다", appearance: "success" })}
      >
        성공 토스트
      </Button>
      <Button
        variant="subtle"
        onClick={() => toast({ title: "저장 실패", description: "네트워크를 확인하세요", appearance: "danger" })}
      >
        실패 토스트
      </Button>
      <Button variant="subtle" onClick={() => toast({ title: "새 댓글이 달렸습니다" })}>
        기본 토스트
      </Button>
      <Button
        variant="subtle"
        onClick={() =>
          toast({
            title: "문서를 휴지통으로 옮겼습니다",
            action: { label: "되돌리기", onClick: () => undefined, altText: "휴지통에서 복원할 수 있습니다" },
          })
        }
      >
        동작 버튼 토스트
      </Button>
    </div>
  );
}

const meta = {
  title: "Components/Toast",
  component: ToastProvider,
} satisfies Meta<typeof ToastProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: null,
  },
  render: () => (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  ),
};

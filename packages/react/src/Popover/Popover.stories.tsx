import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import { Popover } from "./Popover";

const meta = {
  title: "Components/Popover",
  component: Popover,
  parameters: {
    docs: {
      description: {
        component:
          "트리거에 붙는 비모달 오버레이(Atlassian popup). 포털·충돌 회피(가장자리 8px)·포커스 이동/복귀를 맡는다. " +
          "제목이 없으면 `label`로 대화상자 이름을 준다.",
      },
    },
  },
  args: {
    label: "보기 설정",
    trigger: <Button variant="secondary">보기 설정</Button>,
    children: null,
  },
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 220 }}>
        <Checkbox label="완료 항목 보기" defaultChecked />
        <Checkbox label="하위 항목 보기" />
        <Checkbox label="빈 열 숨기기" />
      </div>
    ),
  },
};

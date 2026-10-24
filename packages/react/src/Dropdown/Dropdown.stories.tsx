import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { Dropdown } from "./Dropdown";

const meta = {
  title: "Components/Dropdown",
  component: Dropdown,
} satisfies Meta<typeof Dropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: <Button variant="subtle">더보기</Button>,
    items: [
      { label: "수정" },
      { label: "복제" },
      { label: "보관", disabled: true },
      { label: "삭제", danger: true },
    ],
  },
};

/** 체크 항목 — 지라 "보기 옵션"처럼 켜고 끄는 메뉴. */
export const Checkable: Story = {
  args: {
    trigger: <Button variant="subtle">보기 옵션</Button>,
    items: [
      { heading: "표시" },
      { label: "완료 항목 보기", checked: true },
      { label: "하위 항목 보기", checked: false },
      { separator: true },
      { label: "필드 구성…" },
    ],
  },
};

/** 긴 목록·긴 라벨 — 뷰포트 남은 높이까지만 열리고 안에서 스크롤, 긴 라벨은 말줄임(title로 전체). */
export const LongList: Story = {
  args: {
    trigger: <Button variant="subtle">스페이스로 이동</Button>,
    items: Array.from({ length: 40 }, (_, i) => ({
      label: i % 7 === 0 ? `아주 긴 한글 스페이스 이름이 들어가서 말줄임되는 경우 ${i + 1}` : `스페이스 ${i + 1}`,
    })),
  },
};

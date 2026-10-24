import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./Select";

/** 스토리용 색 사각형 — 소비자가 아이콘 크기를 정한다는 것을 보인다. */
function TypeIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <rect width="14" height="14" rx="3" fill={color} />
    </svg>
  );
}

const OPTIONS = [
  { value: "high", label: "높음" },
  { value: "medium", label: "보통" },
  { value: "low", label: "낮음" },
];

const meta = {
  title: "Components/Select",
  component: Select,
  args: { label: "우선순위", options: OPTIONS, placeholder: "선택하세요" },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Preselected: Story = { args: { defaultValue: "medium" } };

export const Disabled: Story = { args: { disabled: true } };

/**
 * 이슈 타입·상태·우선순위처럼 아이콘이 뜻을 나르는 목록.
 * 아이콘은 목록과 트리거 선택값 양쪽에 나오고, 크기는 소비자가 정한다.
 */
export const WithIcons: Story = {
  args: {
    label: "이슈 타입",
    defaultValue: "story",
    options: [
      { value: "epic", label: "에픽", icon: <TypeIcon color="var(--chanho-color-text-brand)" /> },
      { value: "story", label: "스토리", icon: <TypeIcon color="var(--chanho-color-text-success)" /> },
      { value: "task", label: "작업", icon: <TypeIcon color="var(--chanho-color-text-info)" /> },
    ],
  },
};

const PEOPLE = [
  { value: "me", label: "나에게 할당", group: "추천" },
  { value: "unassigned", label: "할당 안 됨", group: "추천" },
  ...Array.from({ length: 30 }, (_, i) => ({
    value: `u${i}`,
    label: i === 4 ? "아주 긴 한글 이름을 가진 구성원이라서 말줄임되는 경우입니다" : `구성원 ${i + 1}`,
    group: "전체 구성원",
    disabled: i === 7,
  })),
];

/** 그룹 — 같은 group 옵션이 제목 아래 묶인다. 최대 높이 300px, 넘치면 목록이 스크롤된다. */
export const Grouped: Story = { args: { label: "담당자", options: PEOPLE, placeholder: "선택" } };

/** 검색형 — 옵션이 많을 때. 입력으로 거르고 ↑↓·Home·End·Enter로 고른다(Atlassian PopupSelect). */
export const Searchable: Story = {
  args: { label: "담당자", options: PEOPLE, placeholder: "선택", searchable: true, searchPlaceholder: "이름 검색" },
};

/** compact(32px) — 버튼·필터 줄과 같은 높이. */
export const Compact: Story = { args: { size: "compact", defaultValue: "medium" } };

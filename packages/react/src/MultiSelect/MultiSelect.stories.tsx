import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MultiSelect } from "./MultiSelect";

const STATUS = [
  { value: "todo", label: "할 일", group: "카테고리: 할 일" },
  { value: "doing", label: "진행 중", group: "카테고리: 진행 중" },
  { value: "review", label: "검토 중", group: "카테고리: 진행 중" },
  { value: "blocked", label: "차단됨", group: "카테고리: 진행 중", disabled: true },
  { value: "done", label: "완료", group: "카테고리: 완료" },
];

const meta = {
  title: "Components/MultiSelect",
  component: MultiSelect,
  args: { label: "상태", options: STATUS, placeholder: "전체" },
  parameters: {
    docs: {
      description: {
        component:
          "여러 개 고르는 선택(지라 필터 줄의 체크 목록). 트리거는 칩으로 요약하고, 팝오버 안에서 검색·체크·전체 해제를 한다. " +
          "고를 때 닫히지 않는다. 필터 줄에서는 `size=\"compact\"`(32px)로 버튼과 높이를 맞춘다.",
      },
    },
  },
} satisfies Meta<typeof MultiSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Preselected: Story = { args: { defaultValue: ["todo", "doing", "done"] } };

export const CompactFilterBar: Story = {
  name: "필터 줄(compact)",
  args: { size: "compact", defaultValue: ["doing"] },
};

export const WithoutSearch: Story = { args: { searchable: false } };

const LABELS = ["frontend", "backend", "infra", "front-office", "design", "docs"];

/** 검색어마다 서버가 후보를 거르는 흉내(250ms 지연) — 위키 검색의 라벨 필터 같은 자리 */
function AsyncLabels() {
  const [options, setOptions] = useState(LABELS.map((l) => ({ value: l, label: l })));
  const [loading, setLoading] = useState(false);
  return (
    <MultiSelect
      label="라벨"
      placeholder="라벨 선택"
      options={options}
      loading={loading}
      creatable
      onSearchChange={(q) => {
        setLoading(true);
        setTimeout(() => {
          setOptions(LABELS.filter((l) => l.includes(q)).map((l) => ({ value: l, label: l })));
          setLoading(false);
        }, 250);
      }}
    />
  );
}

export const AsyncCreatable: Story = {
  name: "비동기 후보 + 직접 추가",
  render: () => <AsyncLabels />,
};

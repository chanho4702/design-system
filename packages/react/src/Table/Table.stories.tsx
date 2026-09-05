import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Checkbox } from "../Checkbox/Checkbox";
import { Table } from "./Table";
import type { SortDirection, TableColumn } from "./Table";

interface Member {
  id: string;
  name: string;
  role: string;
  commits: number;
}

const members: Member[] = [
  { id: "1", name: "김철수", role: "프론트엔드", commits: 128 },
  { id: "2", name: "이영희", role: "백엔드", commits: 342 },
  { id: "3", name: "박민수", role: "디자인", commits: 57 },
];

const columns: TableColumn<Member>[] = [
  { key: "name", header: "이름", sortable: true },
  { key: "role", header: "역할" },
  { key: "commits", header: "커밋", sortable: true, align: "right" },
];

const meta = {
  title: "Components/Table",
  component: Table<Member>,
} satisfies Meta<typeof Table<Member>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { "aria-label": "팀원", columns, rows: members },
};

export const Sortable: Story = {
  args: { "aria-label": "팀원", columns, rows: members },
  render: () => {
    const [sortKey, setSortKey] = useState("commits");
    const [dir, setDir] = useState<SortDirection>("desc");
    const sorted = [...members].sort((a, b) => {
      const av = a[sortKey as keyof Member];
      const bv = b[sortKey as keyof Member];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return dir === "asc" ? cmp : -cmp;
    });
    return (
      <Table<Member>
        aria-label="팀원"
        columns={columns}
        rows={sorted}
        sortKey={sortKey}
        sortDirection={dir}
        onSort={(key) => {
          if (key === sortKey) {
            setDir((d) => (d === "asc" ? "desc" : "asc"));
          } else {
            setSortKey(key);
            setDir("asc");
          }
        }}
      />
    );
  },
};

export const Selectable: Story = {
  args: { "aria-label": "팀원", columns, rows: members },
  render: () => {
    const [selectedId, setSelectedId] = useState<string>("2");
    return (
      <Table<Member>
        aria-label="팀원"
        columns={columns}
        rows={members}
        selectedId={selectedId}
        onRowClick={(row) => setSelectedId(row.id)}
      />
    );
  },
};

export const StickyHeader: Story = {
  args: {
    "aria-label": "팀원",
    columns,
    rows: [...members, ...members, ...members].map((m, i) => ({ ...m, id: String(i) })),
    stickyHeader: true,
    maxHeight: 160,
  },
};

/**
 * header는 ReactNode라 "모두 선택" 체크박스처럼 상호작용하는 노드도 넣을 수 있다.
 * 노드 헤더는 정렬 버튼·너비 조절 핸들의 이름을 만들 수 없으므로 ariaLabel로 문자열을 준다
 * (ALM 이슈 목록의 일괄 선택 열).
 */
export const NodeHeader: Story = {
  args: { "aria-label": "팀원", columns, rows: members },
  render: () => {
    const [selected, setSelected] = useState<string[]>([members[0].id]);
    const allChecked = selected.length === members.length;
    const someChecked = selected.length > 0 && !allChecked;
    const selectColumn: TableColumn<Member> = {
      key: "select",
      ariaLabel: "모두 선택",
      adjustable: false,
      width: "48px",
      header: (
        <Checkbox
          label="모두 선택"
          labelHidden
          checked={allChecked ? true : someChecked ? "indeterminate" : false}
          onCheckedChange={(next) => setSelected(next === true ? members.map((m) => m.id) : [])}
        />
      ),
      render: (row) => (
        <Checkbox
          label={`${row.name} 선택`}
          labelHidden
          checked={selected.includes(row.id)}
          onCheckedChange={(next) =>
            setSelected((prev) =>
              next === true ? [...prev, row.id] : prev.filter((id) => id !== row.id),
            )
          }
        />
      ),
    };
    return (
      <Table<Member>
        aria-label="팀원"
        columns={[selectColumn, ...columns]}
        rows={members}
        resizable
      />
    );
  },
};

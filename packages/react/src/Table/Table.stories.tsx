import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
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

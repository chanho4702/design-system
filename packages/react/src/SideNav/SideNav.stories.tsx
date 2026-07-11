import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SideNav } from "./SideNav";

const ITEMS = [
  { id: "dashboard", label: "대시보드" },
  { id: "issues", label: "이슈", badge: 12 },
  { id: "board", label: "보드" },
  { id: "reports", label: "리포트" },
];

const meta = {
  title: "Components/SideNav",
  component: SideNav,
  args: {
    items: ITEMS,
    activeId: "issues",
    collapsed: false,
    onToggleCollapse: () => {},
  },
} satisfies Meta<typeof SideNav>;

export default meta;

type Story = StoryObj<typeof meta>;

function Demo({ collapsed: initialCollapsed = false }: { collapsed?: boolean }) {
  const [activeId, setActiveId] = useState("issues");
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  return (
    <div style={{ height: 360, display: "flex" }}>
      <SideNav
        items={ITEMS}
        activeId={activeId}
        onSelect={setActiveId}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <Demo />,
};

export const Collapsed: Story = {
  render: () => <Demo collapsed />,
};

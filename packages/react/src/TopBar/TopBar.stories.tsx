import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "../Avatar/Avatar";
import { Button } from "../Button/Button";
import { TopBar } from "./TopBar";

const meta = {
  title: "Components/TopBar",
  component: TopBar,
  args: { brand: "Chanho Tracker" },
} satisfies Meta<typeof TopBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSearchAndActions: Story = {
  args: {
    onSearch: () => {},
    searchPlaceholder: "이슈, 사람, 프로젝트 검색",
    actions: (
      <>
        <Button variant="subtle">만들기</Button>
        <Avatar name="김찬호" size="small" />
      </>
    ),
  },
};

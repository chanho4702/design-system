import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton, SkeletonAvatar, SkeletonListItem, SkeletonText } from "./Skeleton";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component:
          "콘텐츠 자리 표시(Atlassian `@atlaskit/skeleton`). 페이지·목록 로딩은 스피너 대신 스켈레톤을 쓴다. " +
          "로딩 영역마다 한 곳에만 `label`을 줘 스크린리더에 알리고, 나머지 블록은 장식으로 둔다.",
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Block: Story = { args: { width: 240, height: 48 } };

export const Circle: Story = { args: { variant: "circle", width: 40 } };

export const NoShimmer: Story = { args: { width: 240, height: 16, shimmer: false } };

export const Text: Story = {
  render: () => <SkeletonText lines={4} width={360} label="본문을 불러오는 중" />,
};

export const PageHeader: Story = {
  name: "페이지 머리 + 본문",
  render: () => (
    <div style={{ width: 480, display: "flex", flexDirection: "column", gap: 16 }} role="status" aria-label="페이지를 불러오는 중">
      <Skeleton width={160} height={12} />
      <Skeleton width="70%" height={28} radius="medium" />
      <SkeletonText lines={5} />
    </div>
  ),
};

export const ListItems: Story = {
  name: "목록·사이드바",
  render: () => (
    <div style={{ width: 280 }}>
      <SkeletonListItem media="icon" label="메뉴를 불러오는 중" />
      <SkeletonListItem media="icon" width="45%" />
      <SkeletonListItem media="avatar" lines={2} />
      <SkeletonListItem media="avatar" lines={2} width="70%" />
    </div>
  ),
};

export const Avatars: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <SkeletonAvatar size="small" />
      <SkeletonAvatar />
      <SkeletonAvatar size="large" />
    </div>
  ),
};

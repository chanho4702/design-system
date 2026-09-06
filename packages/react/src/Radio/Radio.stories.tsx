import type { Meta, StoryObj } from "@storybook/react-vite";
import { Radio, RadioGroup } from "./Radio";

/** 스토리용 아이콘 — 라벨이 ReactNode라 아이콘+텍스트를 넣을 수 있다. */
function DotIcon({ color }: { color: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <circle cx="5" cy="5" r="5" fill={color} />
    </svg>
  );
}


const meta = {
  title: "Components/Radio",
  component: RadioGroup,
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup aria-label="우선순위" defaultValue="medium">
      <Radio value="high" label="높음" />
      <Radio value="medium" label="보통" />
      <Radio value="low" label="낮음" />
    </RadioGroup>
  ),
};

export const WithDisabledItem: Story = {
  render: () => (
    <RadioGroup aria-label="우선순위" defaultValue="high">
      <Radio value="high" label="높음" />
      <Radio value="medium" label="보통" disabled />
      <Radio value="low" label="낮음" />
    </RadioGroup>
  ),
};

/** 라벨은 ReactNode라 아이콘·배지를 넣을 수 있다. 접근 이름은 라벨 안 텍스트로 남는다. */
export const NodeLabel: Story = {
  render: () => (
    <RadioGroup aria-label="우선순위" defaultValue="high">
      <Radio
        value="high"
        label={
          <>
            <DotIcon color="var(--chanho-color-text-danger)" /> 높음
          </>
        }
      />
      <Radio
        value="medium"
        label={
          <>
            <DotIcon color="var(--chanho-color-text-warning)" /> 보통
          </>
        }
      />
      <Radio
        value="low"
        label={
          <>
            <DotIcon color="var(--chanho-color-text-success)" /> 낮음
          </>
        }
      />
    </RadioGroup>
  ),
};

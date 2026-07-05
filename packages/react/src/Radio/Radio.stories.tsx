import type { Meta, StoryObj } from "@storybook/react-vite";
import { Radio, RadioGroup } from "./Radio";

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

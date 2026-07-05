import { palette } from "@chanho/tokens";
import type { Meta, StoryObj } from "@storybook/react-vite";

function Palette() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {Object.entries(palette).map(([name, scale]) => (
        <div key={name}>
          <strong>{name}</strong>
          <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
            {Object.entries(scale).map(([step, hex]) => (
              <div key={step} style={{ width: 64 }}>
                <div
                  style={{
                    height: 40,
                    borderRadius: 6,
                    background: hex,
                    border: "1px solid var(--chanho-color-border-default)",
                  }}
                />
                <small>
                  {step}
                  <br />
                  {hex}
                </small>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const meta = {
  title: "Tokens/Palette",
  component: Palette,
} satisfies Meta<typeof Palette>;

export default meta;

export const All: StoryObj<typeof meta> = {};

import type { Preview } from "@storybook/react-vite";
import "@chanho/tokens/css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "컬러 테마",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, context) => {
      document.documentElement.dataset.theme = context.globals.theme;
      return (
        <div
          style={{
            background: "var(--chanho-color-background-default)",
            color: "var(--chanho-color-text-default)",
            fontFamily: "var(--chanho-font-family-sans)",
            padding: 24,
            minHeight: "100vh",
          }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    css: true,
    // 화면 통합 테스트는 Radix 오버레이를 여러 겹 그린다 — 병렬 실행 중에는 기본 5초를 넘길 수 있다.
    testTimeout: 20000,
  },
});

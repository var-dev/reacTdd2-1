import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.vitest.tsx", "test/**/*.vitest.tsx"],
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
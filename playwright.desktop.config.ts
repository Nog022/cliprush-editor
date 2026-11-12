import { defineConfig } from "@playwright/test";
export default defineConfig({ testDir: "tests/desktop", testMatch: "**/*.e2e.ts", timeout: 180000, workers: 1, reporter: "list", outputDir: "out/desktop-test-results", use: { trace: "retain-on-failure" } });

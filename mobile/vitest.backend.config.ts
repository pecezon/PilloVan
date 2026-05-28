import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "convex",
    include: ["convex/**/*.test.{ts,js}"],
    exclude: [
      ...configDefaults.exclude,
      "node_modules/**",
      "shared/**",
      "convex/_generated/**",
      "convex/schema.ts",
      "convex/auth.config.ts",
    ],
    environment: "edge-runtime",
    coverage: {
      provider: "v8",
      reporter: ["text"],
      reportsDirectory: "./coverage/convex",
      include: ["convex/**/*.ts"],
      exclude: [
        "convex/**/*.test.ts",
        "convex/test.setup.ts",
        "convex/_generated/**",
        "convex/schema.ts",
        "convex/auth.config.ts",
        "shared/**",
      ],
      excludeAfterRemap: true,
      skipFull: false,
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
});

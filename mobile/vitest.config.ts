import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
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
        },
      },
      {
        extends: true,
        test: {
          name: "frontend",
          include: ["**/*.test.{ts,tsx,js,jsx}"],
          exclude: [
            ...configDefaults.exclude,
            "node_modules/**",
            "dist/**",
            "coverage/**",
            ".expo/**",
            "convex/**",
            "shared/**",
          ],
          environment: "jsdom",
        },
      },
    ],
  },
});

// ESLint flat config for the PilloVan mobile app.
// Static analysis only — code style/formatting is owned by Prettier.
// `eslint-config-prettier` is loaded last to disable any rules that would
// fight the formatter.
const expoConfig = require("eslint-config-expo/flat");
const prettierConfig = require("eslint-config-prettier/flat");

module.exports = [
  // Globally ignored paths (vendored, generated, build, coverage).
  {
    ignores: [
      "node_modules/**",
      ".expo/**",
      "dist/**",
      "web-build/**",
      "coverage/**",
      "convex/_generated/**",
      "components/ui/**", // vendored Gluestack UI — do not lint
      ".agents/**", // vendored Convex agent skills
      "babel.config.js",
      "metro.config.js",
      "tailwind.config.js",
    ],
  },
  ...expoConfig,
  prettierConfig,
  {
    // react-hooks v7 ships two new, very strict rules that flag long-standing
    // patterns in this codebase (incl. Expo starter-template files and the
    // auth hook). Keep them visible as warnings — they show up in reports and
    // editor, but don't block lint/CI/commits — rather than silencing them.
    rules: {
      "react-hooks/static-components": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "src/generated/**",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
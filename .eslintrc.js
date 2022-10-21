module.exports = {
  parser: `@typescript-eslint/parser`,
  env: {
    browser: true,
    node: true,
    es2020: true,
    jest: true,
  },
  extends: [
    "airbnb-typescript",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier",
  ],
  parserOptions: {
    project: `./tsconfig.eslint.json`,
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 11,
    sourceType: "module",
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx", ".js", ".jsx", ".svg"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
      },
    },
  },
  plugins: ["@typescript-eslint", "prettier", "react", "jsx-a11y", "import"],
  rules: {
    "prettier/prettier": ["error"],
    "import/prefer-default-export": 0,
    "react/jsx-props-no-spreading": 0,
    "react/prop-types": 0,
    "arrow-body-style": 0,
    "react/self-closing-comp": 0,
    "react/react-in-jsx-scope": 0,
    "react/jsx-fragments": 0,
    "react/require-default-props": 0,
    "react/display-name": 1,
    "@typescript-eslint/default-param-last": 0,
    "@typescript-eslint/naming-convention": 0,
    "@typescript-eslint/no-redeclare": 0,
    "@typescript-eslint/ban-types": 0,
    "@typescript-eslint/no-shadow": 0,
    "@typescript-eslint/no-use-before-define": 0,
    "@typescript-eslint/no-var-requires": 1,
    "@typescript-eslint/ban-ts-comment": 1,
    "@typescript-eslint/triple-slash-reference": 0,
    "@typescript-eslint/no-unused-expressions": 0,
    "@typescript-eslint/ban-ts-comment": 0,
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: true,
      },
    ],
  },
};

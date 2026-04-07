import shopifyEslintPlugin from '@shopify/eslint-plugin';

export default [
  ...shopifyEslintPlugin.configs.typescript,
  ...shopifyEslintPlugin.configs.react,
  ...shopifyEslintPlugin.configs.prettier,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    ignores: ['node_modules/**', 'coverage/**', '.expo/**'],
  },
];

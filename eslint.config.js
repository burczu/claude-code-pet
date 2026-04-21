import shopifyEslintPlugin from '@shopify/eslint-plugin';
import reactCompiler from 'eslint-plugin-react-compiler';

export default [
  ...shopifyEslintPlugin.configs.typescript,
  ...shopifyEslintPlugin.configs.react,
  ...shopifyEslintPlugin.configs.prettier,
  reactCompiler.configs.recommended,
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
      'import-x/resolver': {
        node: true,
      },
    },
    rules: {
      // React 17+ new JSX transform — no import needed
      'react/react-in-jsx-scope': 'off',
      // Math code legitimately uses single-char names (π, e, d, s, h)
      'id-length': 'off',
      // i18n is already handled via i18next; hardcoded-content too strict here
      '@shopify/jsx-no-hardcoded-content': 'off',
      // Ternaries in JSX are acceptable in this codebase
      '@shopify/jsx-no-complex-expressions': 'off',
      // Inline comments are fine for short clarifications
      'line-comment-position': 'off',
      // void is a valid pattern for fire-and-forget promises
      'no-void': 'off',
      // Operators (+, -, ×) and external API fields (tool_choice, from_unit) are intentionally named
      '@typescript-eslint/naming-convention': 'off',
      // no-nested-ternary is too strict for small conditional renders
      'no-nested-ternary': 'off',
      // Standard flat config exports an array directly
      'import-x/no-anonymous-default-export': 'off',
      // Standard RN/Expo pattern — extensions not required
      'import-x/extensions': 'off',
      // TypeScript handles module resolution; import-x resolver has false positives on macOS
      'import-x/no-unresolved': 'off',
      // .finally() is a valid terminator for fire-and-forget async operations
      'promise/catch-or-return': ['error', { allowFinally: true }],
    },
  },
  {
    // Type declaration files — SCREAMING_SNAKE_CASE is expected
    files: ['**/*.d.ts'],
    rules: {
      '@shopify/prefer-module-scope-constants': 'off',
    },
  },
  {
    // Jest test files
    files: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      'import-x/no-unresolved': 'off',
    },
  },
  {
    ignores: ['node_modules/**', 'coverage/**', '.expo/**'],
  },
];

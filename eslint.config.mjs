import { libraryConfig } from '@repo/eslint-config/library';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['apps/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}'],
  },
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.mjs', '.*rc.mjs'],
  },
  ...libraryConfig,
  {
    languageOptions: {
      parser: tsParser,
    },
  },
  {
    rules: {
      // we generally use this in isFunction, not via calling
      '@typescript-eslint/unbound-method': 'off',
      // NestJS requires empty decorated classes (@Module, @Controller, etc.)
      '@typescript-eslint/no-extraneous-class': [
        'warn',
        { allowWithDecorator: true },
      ],
    },
  },
];

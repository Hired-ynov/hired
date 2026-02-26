import { libraryConfig } from '@repo/eslint-config/library';
import tsParser from '@typescript-eslint/parser';

export default [
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
      // add override for any (a metric ton of them, initial conversion)
      '@typescript-eslint/no-explicit-any': 'off',
      // we generally use this in isFunction, not via calling
      '@typescript-eslint/unbound-method': 'off',
    },
  },
];

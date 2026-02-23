import { nestConfig } from '@repo/jest-config';
import type { Config } from 'jest';

const { testRegex, ...restConfig } = nestConfig;

export default {
  ...restConfig,
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/test/**/*.spec.ts'],
} as Config;

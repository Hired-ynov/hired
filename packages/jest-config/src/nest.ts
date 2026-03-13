import { config as baseConfig } from './base';

import type { Config } from 'jest';

export const nestConfig = {
  ...baseConfig,
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  rootDir: 'src',
  testEnvironment: 'node',
  testRegex: String.raw`.*\.spec\.ts$`,
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
} as const satisfies Config;

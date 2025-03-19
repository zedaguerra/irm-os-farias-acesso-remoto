import type { CoverageThreshold } from 'vitest';

export const coverageThreshold: CoverageThreshold = {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
};
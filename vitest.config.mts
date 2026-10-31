import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  test: {
    coverage: {
      include: ['src/**/*'],
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage'
    },
    globals: true,
    include: ['src/__tests__/**/*.test.ts'],
    setupFiles: ['./vitest.setup.ts']
  }
});

# Design Spec: Vitest Migration and Security Fix

**Date**: 2026-07-28
**Status**: Approved

## Context & Goals

The project currently has multiple security vulnerabilities reported by `npm audit` (92-96 vulnerabilities, including critical and high severity issues).
A significant portion of these vulnerabilities stem from:
1. Outdated version of Jest (v26) and `ts-jest` (v26) used in `apps/api`.
2. Outdated version of `react-router-dom` (v7.11.0) containing open redirect and XSS vulnerabilities.
3. Stale package lockfile preventing the resolution of security overrides.

Additionally, the `apps/api` test runner is broken under the current modern Node.js and TypeScript 6 configuration due to Jest v26 compatibility issues (`TypeError: Jest: a transform must export a process function`).

To solve these issues cleanly and keep the project functional:
- We will completely remove Jest from the project.
- We will migrate the `apps/api` test suite to **Vitest**, unifying it with `apps/web`.
- We will use a compatibility shim for `jest` inside Vitest to avoid rewriting existing tests.
- We will upgrade `react-router-dom` to the latest secure version (`^7.18.2`).
- We will rebuild the lockfile from scratch to force clean resolution of overrides and nested dependencies.

---

## Detailed Design

### 1. Root configuration changes
In [package.json](../../../package.json):
- Remove `"jest": "26.6.3"` and `"@types/jest": "^26.0.24"` from `dependencies`.

### 2. API configuration changes
In [apps/api/package.json](../../../apps/api/package.json):
- Remove:
  - `"jest": "26.6.3"`
  - `"ts-jest": "26.5.6"`
  - `"@types/jest": "^30.0.0"`
  - `"ts-loader": "^9.5.2"`
  - The `"jest"` config object.
- Add to `devDependencies`:
  - `"vitest": "^4.1.10"` (matching `apps/web` version)
  - `"@vitest/coverage-v8": "^4.1.10"` (for coverage)
  - `"unplugin-swc": "^1.5.1"` (for fast NestJS TypeScript transpilation)
  - `"@swc/core": "^1.10.1"` (for SWC compiler dependency)
- Update test scripts:
  - `"test": "vitest run"`
  - `"test:watch": "vitest"`
  - `"test:cov": "vitest run --coverage"`
  - `"test:debug": "vitest --inspect-brk --no-file-parallelism"`

### 3. API Vitest Configuration
Create [apps/api/vitest.config.ts](../../../apps/api/vitest.config.ts):
```ts
import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    environment: 'node',
    alias: {
      src: resolve(__dirname, './src'),
    },
    setupFiles: ['./vitest.setup.ts'],
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
```

Create [apps/api/vitest.setup.ts](../../../apps/api/vitest.setup.ts):
```ts
import { vi } from 'vitest';

// Global shim to allow jest.fn() and jest.spyOn() calls in existing spec files
globalThis.jest = vi as any;
```

Declare global types for the `jest` shim in [apps/api/src/global.d.ts](../../../apps/api/src/global.d.ts):
```ts
import { vi } from 'vitest';

declare global {
  const jest: typeof vi;
}
```

### 4. Dependency Security Upgrades
- Update `react-router-dom` to `^7.18.2` in:
  - Root `package.json`
  - `apps/api/package.json`
  - `apps/web/package.json`
- Delete `package-lock.json` and all `node_modules` folders.
- Run `npm install --legacy-peer-deps` to re-resolve all dependencies and apply current overrides.

---

## Verification Plan

### Automated Tests & Compilation
- Run `npx turbo run build` to verify compiling is still fully functional.
- Run `npx turbo run test` to execute both API and Web test suites.
- Verify all 13 test suites in `apps/api` pass under Vitest.

### Vulnerability Verification
- Run `npm audit` and confirm that vulnerabilities have dropped to 0 (or are minimized to only minor unresolvable packages).

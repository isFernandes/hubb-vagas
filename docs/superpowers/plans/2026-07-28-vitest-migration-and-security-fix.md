# Vitest Migration and Security Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Jest completely from the monorepo, migrate the NestJS API application's test suite to Vitest with a compatibility layer, upgrade React Router Dom to v7.18.2, and regenerate the lockfile to resolve all npm audit vulnerabilities.

**Architecture:** We will replace Jest dependencies with Vitest and SWC in `apps/api`, create a Vitest configuration file, implement a `globalThis.jest = vi` compatibility shim so existing tests don't require code changes, upgrade react-router-dom, delete `package-lock.json`, and run a clean install to rebuild the dependency graph.

**Tech Stack:** Vitest, unplugin-swc, npm overrides, Turbo.

## Global Constraints
- Target clean Vitest integration for `apps/api`.
- Ensure React Router Dom is updated to `^7.18.2` everywhere.
- Recreate `package-lock.json` using `npm install --legacy-peer-deps`.
- Ensure `npx turbo run build` and `npx turbo run test` compile and pass cleanly without issues.

---

### Task 1: Update package.json files and clean install

**Files:**
- Modify: [package.json](../../../package.json)
- Modify: [apps/api/package.json](../../../apps/api/package.json)
- Modify: [apps/web/package.json](../../../apps/web/package.json)

**Interfaces:**
- Consumes: None
- Produces: Updated package configs with Vitest and updated React Router Dom, ready for installation.

- [ ] **Step 1: Edit root package.json**
  Update [package.json](../../../package.json) to remove `"jest"` and `"@types/jest"`, and update `"react-router-dom"` to `"^7.18.2"`.
  ```json
    "dependencies": {
      "@eslint/eslintrc": "0.1.0",
      "@nestjs/cli": "^11.0.0",
      "eslint": "10.8.0",
      "react-router-dom": "^7.18.2"
    }
  ```

- [ ] **Step 2: Edit apps/api/package.json**
  Update [apps/api/package.json](../../../apps/api/package.json) to update `"react-router-dom"` to `"^7.18.2"`, remove the `"jest"` configuration block, remove the Jest/ts-jest devDependencies, and add Vitest/SWC devDependencies and scripts:
  ```json
    "scripts": {
      "build": "nest build",
      "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
      "start": "nest start",
      "dev": "nest start --watch",
      "start:dev": "nest start --watch",
      "start:debug": "nest start --debug --watch",
      "start:prod": "node dist/main",
      "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
      "test": "vitest run",
      "test:watch": "vitest",
      "test:cov": "vitest run --coverage",
      "test:debug": "vitest --inspect-brk --no-file-parallelism",
      "migrate:dev": "prisma migrate dev",
      "migrate:deploy": "prisma migrate deploy"
    },
    "dependencies": {
      ...
      "react-router-dom": "^7.18.2",
      ...
    },
    "devDependencies": {
      "@eslint/eslintrc": "^0.1.0",
      "@eslint/js": "^9.18.0",
      "@nestjs/cli": "^11.0.0",
      "@nestjs/schematics": "^11.0.0",
      "@nestjs/testing": "^11.0.1",
      "@types/bcrypt": "^6.0.0",
      "@types/express": "^5.0.0",
      "@types/ioredis": "^5.0.0",
      "@types/node": "^22.10.7",
      "@types/nodemailer": "^8.0.1",
      "@types/supertest": "^6.0.2",
      "eslint": "^10.8.0",
      "eslint-config-prettier": "^10.0.1",
      "eslint-plugin-prettier": "^5.2.2",
      "globals": "^16.0.0",
      "prettier": "^3.4.2",
      "source-map-support": "^0.5.21",
      "supertest": "^7.0.0",
      "ts-loader": "^9.5.2",
      "ts-node": "^10.9.2",
      "tsconfig-paths": "^4.2.0",
      "typescript": "~6.0.2",
      "typescript-eslint": "^8.20.0",
      "vitest": "^4.1.10",
      "@vitest/coverage-v8": "^4.1.10",
      "unplugin-swc": "^1.5.1",
      "@swc/core": "^1.10.1"
    }
  ```

- [ ] **Step 3: Edit apps/web/package.json**
  Update [apps/web/package.json](../../../apps/web/package.json) to update `"react-router-dom"` to `"^7.18.2"`.

- [ ] **Step 4: Delete package-lock.json and node_modules folders**
  Run from root:
  - PowerShell: `Remove-Item -Recurse -Force package-lock.json, node_modules, apps/api/node_modules, apps/web/node_modules`

- [ ] **Step 5: Run npm install**
  Run from root:
  `npm install --legacy-peer-deps`
  Expected: Installation finishes successfully and creates a fresh package-lock.json.

- [ ] **Step 6: Commit**
  Run:
  `git add package.json package-lock.json apps/api/package.json apps/web/package.json`
  `git commit -m "chore: remove jest, add vitest dependencies, and upgrade react-router-dom"`

---

### Task 2: Configure Vitest and SWC in apps/api

**Files:**
- Create: [apps/api/vitest.config.ts](../../../apps/api/vitest.config.ts)
- Create: [apps/api/vitest.setup.ts](../../../apps/api/vitest.setup.ts)
- Create: [apps/api/src/global.d.ts](../../../apps/api/src/global.d.ts)

**Interfaces:**
- Consumes: Installed `vitest` and `unplugin-swc` dependencies
- Produces: API vitest config and globally bound `jest` mapping to `vi`

- [ ] **Step 1: Create apps/api/vitest.config.ts**
  Write the config using SWC compiler for decorators and NestJS metadata support:
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

- [ ] **Step 2: Create apps/api/vitest.setup.ts**
  Create the setup file containing the global `jest` shim:
  ```ts
  import { vi } from 'vitest';

  // Make jest globals map directly to vitest vi
  globalThis.jest = vi as any;
  ```

- [ ] **Step 3: Create apps/api/src/global.d.ts**
  Declare typing for the global `jest` namespace to prevent TypeScript compiler errors:
  ```ts
  import { vi } from 'vitest';

  declare global {
    const jest: typeof vi;
  }
  ```

- [ ] **Step 4: Run a single test to verify Vitest boots successfully**
  Run:
  `npx vitest run apps/api/src/app.controller.spec.ts`
  Expected: The single test suite runs and passes.

- [ ] **Step 5: Commit**
  Run:
  `git add apps/api/vitest.config.ts apps/api/vitest.setup.ts apps/api/src/global.d.ts`
  `git commit -m "test: configure vitest and swc with jest shim for apps/api"`

---

### Task 3: Execute and fix the test suites

**Files:**
- Modify: (Any failing spec files in `apps/api/src/**/*.spec.ts` if typing or custom matcher issues arise)

**Interfaces:**
- Consumes: Vitest config & setup
- Produces: Corrected spec/test files running successfully under Vitest

- [ ] **Step 1: Execute all API tests using Vitest**
  Run:
  `npx vitest run --root apps/api`
  Expected: Review output. Note any test failures.

- [ ] **Step 2: Resolve any failures**
  If any spec fails due to Jest mock differences or imports:
  - If a test uses a type check like `jest.Mocked`, we can import `MockInstance` or similar from `vitest` or map type definitions in `global.d.ts`:
    ```ts
    import { MockInstance } from 'vitest';
    declare global {
      namespace jest {
        type Mocked<T> = {
          [P in keyof T]: T[P] extends (...args: any[]) => any
            ? MockInstance<T[P]>
            : T[P];
        };
      }
    }
    ```
    (Update `apps/api/src/global.d.ts` with any necessary type definitions if compilation fails).
  - Re-run `npx vitest run --root apps/api` to verify fix.

- [ ] **Step 3: Verify all monorepo tests pass via turbo**
  Run:
  `npx turbo run test`
  Expected: Both `api` and `web` tests run and pass successfully.

- [ ] **Step 4: Commit**
  Run:
  `git add .` (if any spec files were updated)
  `git commit -m "test: make all apps/api spec files compile and pass under vitest"`

---

### Task 4: Verify build and audit security status

**Files:**
- Modify: None

**Interfaces:**
- Consumes: Passing tests and updated lockfile
- Produces: Green builds and resolved security audit report

- [ ] **Step 1: Run turbo build**
  Run:
  `npx turbo run build`
  Expected: Build succeeds for both `api` and `web`.

- [ ] **Step 2: Run npm audit**
  Run:
  `npm audit`
  Expected: Audit returns 0 vulnerabilities (or minimal unavoidable ones).

- [ ] **Step 3: Commit**
  No changes should be left, but clean repository.

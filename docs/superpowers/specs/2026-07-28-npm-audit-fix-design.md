# NPM Audit Fix Strategy Design

## Overview
The goal of this task is to remove all npm vulnerabilities from the monorepo while minimizing the risk of accidentally breaking the application due to unreviewed major version bumps. The project currently has 97 vulnerabilities, many of which are deeply nested or tied to major breaking changes.

## Phase 1: Dependency Reset
The first step is to flush out any outdated transitive dependencies that might be locked in the `package-lock.json` file.
- Delete the root `package-lock.json` file.
- Delete all `node_modules` folders (both in the root and across the workspaces `apps/*` and `packages/*`).
- Run `npm install` to regenerate the lockfile. This will automatically pull in the latest compatible patch and minor versions allowed by the existing `package.json` ranges, potentially clearing out a number of older vulnerable versions without breaking changes.

## Phase 2: Safe Auto-Fixing
Once the lockfile is refreshed, we will evaluate the remaining vulnerabilities.
- Run `npm audit` to determine the new vulnerability baseline.
- If vulnerabilities remain, run `npm audit fix` (strictly without `--force`). This will safely update transitive dependencies to non-vulnerable versions if possible without violating any defined semver ranges.

## Phase 3: Manual Review & Resolution
Any vulnerabilities that persist past Phase 2 require breaking changes to fix (such as bumping Jest from v25 to v30, or updating `@nestjs/cli`).
- Run `npm audit` one final time to list the remaining stubborn vulnerabilities.
- Each remaining vulnerability will be manually reviewed.
- For each item, we will make a specific, documented decision:
  1. Upgrade the package to the new major version (and fix any resulting code breakage).
  2. Implement an `npm overrides` resolution in `package.json` if the vulnerability is a false positive or the vulnerable code path is not used.
  3. Replace the dependency with a more secure alternative if necessary.

## Scope Limits
This task is complete when `npm audit` returns 0 vulnerabilities. Refactoring of code should be limited *only* to what is strictly necessary to accommodate any major version upgrades required by Phase 3.

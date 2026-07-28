# NPM Audit Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all npm vulnerabilities from the monorepo while minimizing the risk of accidentally breaking the application.

**Architecture:** A three-phase approach: flushing the lockfile, applying safe auto-fixes, and finally manually reviewing and resolving any vulnerabilities requiring breaking changes.

**Tech Stack:** Node.js, npm, PowerShell

---

### Task 1: Dependency Reset

**Files:**
- Modify: `package-lock.json`
- Modify: `node_modules/` (deleted and recreated)

- [ ] **Step 1: Delete root lockfile**

```powershell
Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
```

- [ ] **Step 2: Delete all node_modules folders**

```powershell
Get-ChildItem -Path . -Include node_modules -Recurse -Directory | Remove-Item -Recurse -Force
```

- [ ] **Step 3: Regenerate lockfile and install dependencies**

Run: `npm install`
Expected: Successfully installs dependencies and generates a new `package-lock.json`.

- [ ] **Step 4: Commit**

```powershell
git add package-lock.json
git commit -m "chore: reset package-lock.json to pull latest compatible non-breaking dependencies"
```

---

### Task 2: Safe Auto-Fixing

**Files:**
- Modify: `package-lock.json`
- Modify: `package.json` (potentially)

- [ ] **Step 1: Check new vulnerability baseline**

Run: `npm audit`
Expected: Outputs a list of vulnerabilities (hopefully fewer than the original 97).

- [ ] **Step 2: Apply safe auto-fixes**

Run: `npm audit fix`
Expected: Applies safe, non-breaking updates to transitive dependencies.

- [ ] **Step 3: Verify safe fixes applied**

Run: `npm audit`
Expected: Outputs a reduced list of vulnerabilities. No new breaking vulnerabilities should be introduced.

- [ ] **Step 4: Commit**

```powershell
git add package.json package-lock.json
git commit -m "chore: apply safe npm audit fixes"
```

---

### Task 3: Manual Review & Resolution Planning

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Identify remaining vulnerabilities**

Run: `npm audit`
Expected: A list of stubborn vulnerabilities that require breaking changes.

- [ ] **Step 2: Interactive resolution**

For each remaining vulnerability, evaluate whether to:
1. Upgrade the package to the new major version (e.g. `npm install jest@latest`).
2. Add an `overrides` section in `package.json`.

Example of adding an override in `package.json`:
```json
  "overrides": {
    "vulnerable-package": "^2.0.0"
  }
```
After modifying `package.json`, run `npm install` to apply the override.

- [ ] **Step 3: Verify complete resolution**

Run: `npm audit`
Expected: `0 vulnerabilities`

- [ ] **Step 4: Commit final resolutions**

```powershell
git add package.json package-lock.json
git commit -m "chore: manually resolve remaining npm vulnerabilities"
```

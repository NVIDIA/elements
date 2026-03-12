---
name: repo-build-system
description: Wireit orchestration, build optimization, caching strategies, and build troubleshooting for the Elements monorepo. Use this skill whenever the user asks about Wireit configuration, build tasks, build dependencies, cache invalidation, build performance, adding new build tasks to package.json, cross-package dependency patterns, sideEffects declarations, CI pipeline configuration, or diagnosing slow or failing builds. Also trigger when the user mentions wireit, vite build issues, pnpm run ci, or build output problems.
---

# Build System

You MUST review the build system documentation before modifying build configurations or troubleshooting build issues.

## When to Use This Skill

- Optimizing build performance and parallelization
- Understanding Wireit task dependencies
- Troubleshooting build failures or cache issues
- Adding new build tasks to projects
- Configuring build orchestration across packages
- Understanding CI/CD build pipeline

## Quick Reference

### Common Commands

```shell
# Full CI locally (lint, build, test):same as GitLab pipeline
pnpm run ci

# Clean everything (node_modules, dist, .wireit caches)
pnpm run ci:reset

# Build a single project
cd projects/elements && pnpm run build

# Dev mode with watch
cd projects/elements && pnpm run dev
```

### Wireit Basics

Wireit configs live in each project's `package.json` under the `wireit` key. Each task declares:

- `command`:the shell command to run
- `dependencies`:other wireit tasks that must complete first (can be cross-package)
- `files`:input file globs for cache invalidation
- `output`:output file globs that get cached

Wireit skips tasks whose inputs have not changed since the last run. To force a rebuild, delete `.wireit/` in the project directory.

### Dependency Patterns

Cross-package dependencies use the `<package>:<script>` format:

```json
{
  "wireit": {
    "build": {
      "dependencies": ["../themes:build", "../styles:build"],
      "command": "vite build",
      "files": ["src/**/*", "tsconfig.json"],
      "output": ["dist/**"]
    }
  }
}
```

### Troubleshooting Build Failures

| Symptom                                    | Fix                                                                   |
| ------------------------------------------ | --------------------------------------------------------------------- |
| Stale cache causing wrong output           | Delete `.wireit/` in the affected project, then rebuild               |
| "Cannot find module" after package changes | Run `pnpm i --frozen-lockfile` to re-link workspaces                  |
| TypeScript errors after dependency update  | Rebuild dependencies first: `cd projects/themes && pnpm run build`    |
| CI passes locally but fails in pipeline    | Check Node version (`node -v` should match `.nvmrc`) and pnpm version |
| Full reset                                 | `pnpm run ci:reset && pnpm i --frozen-lockfile && pnpm run ci`        |

### Adding a New Wireit Task

1. Add the script to `package.json` with a `wireit` config
2. Declare `files` (inputs) and `output` (outputs) for caching
3. Add `dependencies` on upstream packages that must build first
4. If the task should run in CI, add it to the dependency chain of the root `ci` script

## Key Tools

- **pnpm**:package manager with workspaces
- **Wireit**:build orchestration with caching (like Bazel for Node)
- **Vite**:TypeScript compilation and bundling
- **Semantic Release**:automated versioning from conventional commits

## References

- [Build System Documentation](/projects/internals/BUILD.md)
- [Root Wireit Configuration](/package.json)
- Project `package.json` files for individual build patterns

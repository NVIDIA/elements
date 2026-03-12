---
name: repo-troubleshooting
description: Diagnose and resolve common issues including test failures, build errors, performance regressions, and development environment problems. Use this skill whenever the user reports something broken, failing, timing out, hanging, or producing unexpected results. Trigger on test failures (elementIsStable timeouts, flaky tests, screenshot diffs), build errors (Cannot find module, wireit cache issues, stale output), CI/CD failures, Git LFS problems, port conflicts, lighthouse score regressions, SSR errors, or environment setup issues.
---

# Troubleshooting

You MUST review the troubleshooting guideline when diagnosing test failures, build errors, or performance issues.

## When to Use This Skill

- Debugging unit test failures or timing issues
- Investigating visual regression test differences
- Troubleshooting Lighthouse performance scores
- Resolving build failures or Wireit cache issues
- Fixing Git LFS problems with visual baselines
- Diagnosing CI/CD pipeline failures
- Resolving development environment setup issues
- Investigating performance regressions in tests or builds

## Must Read File

Read the [troubleshooting guide](projects/site/src/docs/internal/guidelines/troubleshooting.md) to get critical context for troubleshooting guidance.

## Diagnostic Triage Workflow

1. **Identify the symptom category:**

   - **Test failure**:unit, axe, visual, SSR, or lighthouse?
   - **Build failure**:Wireit cache, dependency resolution, TypeScript, or circular imports?
   - **Environment issue**:Node version, pnpm version, Git LFS, or port conflict?
   - **Performance regression**:slow tests, slow builds, or large bundles?

2. **Run the relevant diagnostic commands:**

   - Test failures: `pnpm run test -- src/<component>/<component>.test.ts` (isolate the failing test)
   - Build failures: `pnpm run ci:reset` then `pnpm run build` (clear caches first)
   - Environment: `node --version && pnpm --version && git lfs env` (verify toolchain)

3. **Check the matching section** in the troubleshooting guide for the specific symptom/solution pair.

4. **If the issue persists**, compare against a working reference component (badge, button, or card) to spot structural differences.

## Additional References

- [Troubleshooting Guide](/projects/site/src/docs/internal/guidelines/troubleshooting.md) - Common issues and solutions
- [Testing Guidelines](/projects/site/src/docs/internal/guidelines/testing.md) - Test patterns
- [Unit Testing](/projects/site/src/docs/internal/guidelines/testing-unit.md) - Unit test details
- [Visual Testing](/projects/site/src/docs/internal/guidelines/testing-visual.md) - Visual regression details
- [Lighthouse Testing](/projects/site/src/docs/internal/guidelines/testing-lighthouse.md) - Performance testing
- [Build System](/projects/internals/BUILD.md) - Wireit troubleshooting

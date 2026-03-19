---
name: repo-testing
description: Write and run automated tests for Elements components including unit, accessibility, visual, SSR, and lighthouse tests. Use this skill whenever the user wants to write, create, update, or debug test files (.test.ts, .test.axe.ts, .test.visual.ts, .test.ssr.ts, .test.lighthouse.ts). Also trigger when the user asks about createFixture, removeFixture, elementIsStable, emulateClick, untilEvent, runAxe, visual baselines, theme testing, or test structure patterns like describe block naming.
---

# Testing Guidelines

You MUST review @projects/site/src/docs/internal/guidelines/testing.md before making any testing changes.

## When to Use This Skill

- Creating new test files for components (`.test.ts`, `.test.axe.ts`, `.test.visual.ts`, `.test.ssr.ts`, `.test.lighthouse.ts`)
- Debugging test failures or updating existing tests
- Understanding testing utilities from `@internals/testing`
- Setting up test configurations or HTML templates
- Writing tests that follow project patterns

## Test Type Guidelines

Read the specific guideline based on the test type you're working with:

- **Unit Tests (`.test.ts`)**: Read [testing-unit.md](/projects/site/src/docs/internal/guidelines/testing-unit.md) - covers `createFixture`, `elementIsStable`, event testing
- **Accessibility Tests (`.test.axe.ts`)**: Read [testing-accessibility.md](/projects/site/src/docs/internal/guidelines/testing-accessibility.md) - covers axe-core usage, WCAG compliance
- **Visual Tests (`.test.visual.ts`)**: Read [testing-visual.md](/projects/site/src/docs/internal/guidelines/testing-visual.md) - covers Playwright screenshots, theme testing
- **SSR Tests (`.test.ssr.ts`)**: Read [testing-ssr.md](/projects/site/src/docs/internal/guidelines/testing-ssr.md) - covers server-side rendering compatibility
- **Lighthouse Tests (`.test.lighthouse.ts`)**: Read [testing-lighthouse.md](/projects/site/src/docs/internal/guidelines/testing-lighthouse.md) - covers performance, accessibility scores

## Key Principles

1. **Test Isolation**: Each test should be independent with proper setup/teardown using `createFixture` and `removeFixture`
2. **Wait for Stability**: Always use `elementIsStable()` before making assertions on Lit components
3. **Comprehensive Coverage**: All new components require unit, accessibility, and visual tests at minimum
4. **Real User Events**: Use `emulateClick` and `untilEvent` for realistic event testing
5. **Theme Testing**: Visual tests should cover both light and dark themes

## References

- [Testing Overview](/projects/site/src/docs/internal/guidelines/testing.md)
- [Unit Testing](/projects/site/src/docs/internal/guidelines/testing-unit.md)
- [Accessibility Testing](/projects/site/src/docs/internal/guidelines/testing-accessibility.md)
- [Lighthouse Testing](/projects/site/src/docs/internal/guidelines/testing-lighthouse.md)
- [SSR Testing](/projects/site/src/docs/internal/guidelines/testing-ssr.md)
- [Visual Testing](/projects/site/src/docs/internal/guidelines/testing-visual.md)
- [Vite Internals](/projects/internals/vite/README.md)

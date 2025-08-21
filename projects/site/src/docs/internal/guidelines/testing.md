---
{
  title: 'Testing Guidelines',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

The Elements library uses a comprehensive testing strategy with multiple test types to ensure quality, accessibility, and performance. All tests follow consistent patterns and use shared utilities from `@nvidia-elements/testing` and `@internals/vite`.

## Test Types

### Unit Tests (`.test.ts`)

- [Unit Tests (`.test.ts`)](docs/internal/testing/unit/): Standard behavior tests.
- [Accessibility Tests (`.test.axe.ts`)](docs/internal/testing/accessibility/): best practices tests using axe-core.
- [Lighthouse Performance Tests (`.test.lighthouse.ts`)](docs/internal/testing/lighthouse/): performance audits and best practices via Lighthouse
- [Visual Regression Tests (`.test.visual.ts`)](docs/internal/testing/ssr/): Visual regression tests using Playwright screenshots.
- [SSR Tests (`.test.ssr.ts`)](docs/internal/testing/ssr/): Server-side rendering compatibility tests.

## Test Configuration

### Vitest Configs

Each test type has its own Vitest configuration:

- **Unit tests**: `vitest.config.ts` using `libraryTestConfig`
- **Axe tests**: `vitest.axe.ts` using `libraryAxeTestConfig`
- **Lighthouse tests**: `vitest.lighthouse.ts` using `libraryLighthouseConfig`
- **Visual tests**: `vitest.visual.ts` using `libraryVisualTestConfig`
- **SSR tests**: `vitest.ssr.ts` using `libraryLitSSRTestConfig`

### HTML Templates

Lighthouse and Visual tests require HTML templates:

- `vitest.lighthouse.html` - Base template for Lighthouse tests
- `vitest.visual.html` - Base template for Visual tests

## Testing Utilities

### @nvidia-elements/testing

Core testing utilities for DOM manipulation and element stability:

- `createFixture`: Creates test fixture DOM element
- `removeFixture`: Removes test fixture DOM
- `elementIsStable`: Waits for Lit element to be stable
- `emulateClick`: Triggers native click events
- `untilEvent`: Creates promise for event results

## Running Tests

Test scripts should be run in the root directory of the project where the `package.json` is located.

```shell
# Unit tests
pnpm run test

# Accessibility tests
pnpm run test:axe

# Performance tests
pnpm run test:lighthouse

# Visual regression tests
pnpm run test:visual

# SSR tests
pnpm run test:ssr
```

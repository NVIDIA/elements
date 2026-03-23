---
name: repo-accessibility
description: Unified accessibility auditing workflow across static analysis, runtime testing, ARIA patterns, keyboard navigation, and color contrast. Use this skill whenever the user mentions accessibility, a11y, WCAG, ARIA roles, axe tests, screen readers, focus management, keyboard navigation, color contrast, or wants to audit, verify, or fix accessibility on any component. Also use when writing or debugging .test.axe.ts files, checking tabindex management, or reviewing focus trapping behavior.
user_invocable: true
---

# Accessibility Auditing

You MUST read `projects/site/src/docs/internal/guidelines/testing-accessibility.md` before proceeding.

## Audit Scope

When the user invokes this skill for a component, perform the following layers of accessibility verification:

### 1. Static analysis (ESLint lit-a11y)

Run ESLint on the component source and check for `lit-a11y` rule violations:

```shell
cd projects/core && pnpm exec eslint --no-warn-ignored src/<component>/<component>.ts
```

Review the component template for common issues:

- Missing `aria-label` or `aria-labelledby` on interactive elements
- Missing `role` attributes on custom interactive patterns
- Images without `alt` text
- Form inputs without associated labels

### 2. Runtime testing (axe-core)

Verify `<component>.test.axe.ts` exists and covers all component variants:

```
Read path="projects/core/src/<component>/<component>.test.axe.ts"
```

Check that the test:

- Imports `runAxe` from `@internals/testing/axe`
- Tests all visual variants (status, size, disabled states)
- Expects zero violations: `expect(results.violations.length).toBe(0)`
- Properly creates and removes fixtures

### 3. ARIA pattern verification

Identify which WAI-ARIA Authoring Practices pattern the component implements. Verify:

- Correct `role` attribute on the host or internal elements
- Required ARIA states (`aria-expanded`, `aria-selected`, `aria-checked`, etc.)
- Proper `tabindex` management
- Focus management for composite widgets

### 4. Keyboard navigation

Check if the component uses the `keynav` reactive controller from `@nvidia-elements/core/internal`:

```
Grep pattern="keynav|keyNavigationList|KeyNav" path="projects/core/src/<component>/"
```

Verify keyboard interactions match the ARIA pattern:

- Arrow keys for navigation within composite widgets
- Enter/Space for activation
- Escape for dismissal
- Tab for focus entry/exit
- Home/End for first/last item

### 5. Color contrast (theme tokens)

Check that the component uses theme tokens rather than hardcoded colors:

```
Grep pattern="rgb|#[0-9a-fA-F]|hsl" path="projects/core/src/<component>/<component>.css"
```

Flag any hardcoded color values. Verify CSS custom properties map to theme tokens that meet WCAG 2.1 AA contrast ratios (4.5:1 for normal text, 3:1 for large text).

## Output

Present a structured report with:

1. Overall pass/fail status
2. Findings grouped by audit layer
3. Specific remediation steps for each finding
4. Commands to run the relevant tests

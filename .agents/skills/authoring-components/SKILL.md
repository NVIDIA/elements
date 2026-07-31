---
name: authoring-components
description: Guide for creating new Elements components with all required files, base classes, metadata patterns, and test boilerplate. Use this skill whenever the user wants to create, scaffold, or set up a new component from scratch, needs to understand the required 10-file structure, asks about base classes and mixins (LitElement vs ButtonFormControlMixin), define.ts vs index.ts patterns, static metadata, component registration, or sub-component parent relationships. Also trigger when the user mentions creating test boilerplate for all 5 test types.
---

# Authoring Components

You MUST review the component creation guideline before creating or modifying components.

## When to Use This Skill

- Creating a new component from scratch
- Understanding the required file structure for components
- Setting up test boilerplate for all 5 test types
- Choosing the appropriate base class or mixin (ButtonFormControlMixin vs LitElement)
- Understanding component metadata and registration patterns
- Setting up JSDoc comments for components

## Must Read File

Read the [component creation guide](projects/site/src/docs/internal/guidelines/component-creation.md) to get critical context for component creation guidance.

## Workflow

1. **Gather requirements**: confirm the component name (kebab-case), purpose, and whether to use `LitElement` directly or apply `ButtonFormControlMixin` for button-like interactive components.
2. **Study a reference**: read the closest reference component listed below to understand the pattern in practice.
3. **Create the 10 required files** in `projects/core/src/<component-name>/`:
   - `component-name.ts`:component class with metadata, JSDoc, and render method
   - `component-name.css`:styles using CSS custom properties
   - `component-name.examples.ts`:example templates with `@summary` JSDoc
   - `component-name.test.ts`:unit tests
   - `component-name.test.axe.ts`:accessibility tests
   - `component-name.test.visual.ts`:visual regression tests
   - `component-name.test.ssr.ts`:SSR tests
   - `component-name.test.lighthouse.ts`:lighthouse tests
   - `define.ts`:registration using `define()` helper with `HTMLElementTagNameMap`
   - `index.ts`:side-effect-free export
4. **Update shared entry points**:
   - Add only `import '@nvidia-elements/core/<component-name>/define.js'` to `projects/core/src/bundle.ts` in alphabetical order. Keep this registration bundle import-only. Export the public API from the component `index.ts` and expose its entry point through the package `exports` map.
   - Add the definition import to the `js-modules` list in `projects/core/src/index.test.lighthouse.ts` so the combined direct-import benchmark measures the component.
5. **Measure payloads**: run `mise exec -- pnpm run test:lighthouse` from `projects/core`. Increase a bundle-size limit only when the measured payload exceeds the current limit.
6. **Verify**: confirm all files follow the templates in the component creation guide, then run `mise exec -- pnpm run lint` and `mise exec -- pnpm run test` from `projects/core`.

## References

- [Component Creation Guide](/projects/site/src/docs/internal/guidelines/component-creation.md) - Complete component creation workflow
- [TypeScript Guidelines](/projects/site/src/docs/internal/guidelines/typescript.md) - Type safety patterns
- [Examples Guidelines](/projects/site/src/docs/internal/guidelines/examples.md) - Example file structure
- [Testing Guidelines](/projects/site/src/docs/internal/guidelines/testing.md) - Testing strategy
- [API Design - Properties](/projects/site/src/docs/api-design/properties-attributes.md) - Property design patterns
- [API Design - Styles](/projects/site/src/docs/api-design/styles.md) - CSS custom properties

### Reference Components

- `/projects/core/src/button/` - ButtonFormControlMixin pattern example
- `/projects/core/src/badge/` - LitElement pattern example
- `/projects/core/src/card/` - Composition with slots example

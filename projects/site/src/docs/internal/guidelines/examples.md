---
{
  title: 'Examples',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

This document provides guidance on creating well-written example templates for the Elements design system.

## Core Principles

### 1. Always Use `@summary` JSDoc Comments

Every example **must** include a `@summary` JSDoc comment that explains:

- Descriptions must be concise one or two sentences only.
- **What** the example demonstrates
- **Why** this pattern is useful
- **When** to use this approach
- **How** it improves the user experience

```typescript
/**
 * @summary Basic badge component with default styling. Use for simple non-interactive labels or status indicators.
 */
export const Default = {
  render: () => html`<nve-badge>badge</nve-badge>`
};
```

### 2. Stateless Examples by Default

Examples should be stateless when possible, focusing on demonstrating the component's capabilities rather than complex interactions:

```typescript
// ✅ Good: Stateless example
export const Status = {
  render: () => html`
    <div nve-layout="row gap:xs align:wrap">
      <nve-badge status="scheduled">scheduled</nve-badge>
      <nve-badge status="queued">queued</nve-badge>
      <nve-badge status="pending">pending</nve-badge>
    </div>
  `
};

// ❌ Avoid: Complex state management unless demonstrating specific patterns
export const ComplexState = {
  render: () => html`<!-- Complex state logic here -->`
};
```

### 3. Use Plain HTML/CSS/JS

Examples should use standard web technologies without unnecessary abstractions:

```typescript
// ✅ Good: Plain HTML with inline styles when needed
export const Overflow = {
  render: () => html`
    <nve-badge status="pending" style="--width: 150px">
      some really long content
    </nve-badge>
  `
};

// ✅ Good: Simple script tags for interactive examples
export const ScrollPosition = {
  render: () => html`
    <nve-grid id="scroll-position-grid" style="height: 402px">
      <!-- grid content -->
    </nve-grid>
    <script type="module">
      const grid = document.querySelector('#scroll-position-grid');
      const button = document.querySelector('#scroll-top-button');
      button.addEventListener('click', () => {
        grid.scrollTo({ top: 0, behavior: 'smooth' });
      });
    </script>
  `
};
```

## Example Structure Patterns

### Basic Component Examples

```typescript
/**
 * @summary [Brief description of what this demonstrates and when to use it]
 */
export const ExampleName = {
  render: () => html`
    <!-- Simple, focused HTML demonstrating the pattern -->
  `
};
```

### Status/Variant Examples

```typescript
/**
 * @summary [Status badges with predefined colors for different states.
 * Ideal for showing job status, task progress, or system states.]
 */
export const Status = {
  render: () => html`
    <div nve-layout="row gap:xs align:wrap">
      <nve-badge status="scheduled">scheduled</nve-badge>
      <nve-badge status="queued">queued</nve-badge>
      <nve-badge status="pending">pending</nve-badge>
    </div>
  `
};
```

### Interactive Examples (When Necessary)

```typescript
/**
 * @summary [Description of the interactive behavior and when it's useful]
 */
export const InteractiveExample = {
  render: () => html`
    <!-- HTML structure -->
    <script type="module">
      // Simple, focused JavaScript for the interaction
      const element = document.querySelector('#example-element');
      element.addEventListener('click', () => {
        // Minimal interaction logic
      });
    </script>
  `
};
```

### Complex Component Examples (Grid, Tables, etc.)

```typescript
/**
 * @summary [Comprehensive description of the pattern,
 * including accessibility considerations and use cases]
 */
export const ComplexPattern = {
  render: () => html`
    <nve-grid>
      <nve-grid-header>
        ${Array(5).fill('').map((_, i) => html`
          <nve-grid-column>column ${i}</nve-grid-column>
        `)}
      </nve-grid-header>
      ${Array(10).fill('').map((_, r) => html`
        <nve-grid-row>
          ${Array(5).fill('').map((_, c) => html`
            <nve-grid-cell>cell ${r}-${c}</nve-grid-cell>
          `)}
        </nve-grid-row>
      `)}
    </nve-grid>
  `
};
```

## Description Writing Guidelines

### Good Descriptions

- **Specific and actionable**: "Use for simple non-interactive labels or status indicators"
- **Context-aware**: "Ideal for showing job status, task progress, or system states"
- **UX-focused**: "Perfect for dense layouts or when you want less visual weight"
- **Accessibility-conscious**: "using aria-label for accessibility"

### Description Structure

1. **Opening**: What the example demonstrates
2. **Context**: When/why to use this pattern
3. **Benefits**: How it improves UX or solves problems
4. **Technical notes**: Any important implementation details

### Examples of Well-Written Descriptions

```typescript
/**
 * @summary Badges with predefined status colors for different states.
 * Ideal for showing job status, task progress, or system states.
 */

/**
 * @summary Flat container badges with status colors for a more subtle appearance. Ideal for dense layouts or when you want less visual weight.
 */

/**
 * @summary The datagrid follows the [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/data-grids/#kbd_label)
 * for standardized keyboard navigation.
 */

/**
 * @summary Multi Select rows use a checkbox as the first focusable item within the row. When selected set the `selected` attribute/property on the row. This will ensure selected styles as well as the proper `ariaSelected` state for accessibility.
 */
```

## Anti-Patterns to Avoid

### ❌ Poor Descriptions

```typescript
/**
 * @summary Default badge example.
 */
```

```typescript
/**
 * @summary Badge examples with status colors.
 */
```

### Avoid Overly Complex State

```typescript
// Avoid complex state management unless demonstrating specific patterns
export const OverlyComplex = {
  render: () => html`<!-- Complex state logic that obscures the example -->`
};
```

### Avoid Unclear Use Cases

```typescript
/**
 * @summary Different badge styles
 */
// Should explain when to use each style
```

## Best Practices Summary

1. **Always include `@summary`** - Every example needs clear documentation
2. **Keep examples stateless** - Focus on component capabilities, not complex interactions
3. **Use plain HTML/CSS/JS** - Avoid unnecessary abstractions
4. **Write descriptive descriptions** - Explain what, why, when, and how
5. **Include accessibility notes** - Use ARIA attributes when appropriate
6. **Provide context** - Explain the UX benefits and use cases
7. **Keep examples focused** - One clear concept per example
8. **Use semantic naming** - Example names should clearly indicate their purpose

## Example Checklist

Before submitting an example, ensure:

- [ ] `@summary` JSDoc comment is present and comprehensive
- [ ] Description explains the UX intent and use cases
- [ ] Example is stateless (unless demonstrating specific state patterns)
- [ ] Uses plain HTML/CSS/JS without unnecessary abstractions
- [ ] Includes accessibility considerations when relevant
- [ ] Example name clearly indicates its purpose
- [ ] Code is clean and readable
- [ ] Follows established patterns from existing examples

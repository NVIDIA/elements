---
{
  title: 'Examples',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Examples are stateless HTML templates demonstrating UI patterns for the Elements design system. Well defined examples are critical for providing a portable documentation format for the CLI, MCP and documentation site. This document provides guidance on creating well-written example templates. (`*.examples.ts`).

## Core Principles

### Example Title

The example title name should be no more than three words. This name references the function and renders in API/Documentation endpoints.

#### Naming Format

- **Use PascalCase** for all example names (for example, `Default`, `StatusFlat`, `FormSubmit`)
- Names should describe **what** the example shows, not **how** it works; explain how in the summary.

#### Single-Word Names

Use single words for basic API features and properties:

| Pattern             | Examples                                           |
| ------------------- | -------------------------------------------------- |
| Default/basic usage | `Default`                                          |
| API properties      | `Status`, `Size`, `Color`, `Position`, `Alignment` |
| Container variants  | `Flat`, `Inline`                                   |
| States              | `Pressed`, `Selected`, `Disabled`                  |
| Slots/content       | `Content`, `Actions`                               |
| Features            | `Closable`, `Events`, `Overflow`                   |

#### Compound Names (2-3 words)

Use compound PascalCase for combinations or specific features and patterns:

| Pattern            | Examples                                       |
| ------------------ | ---------------------------------------------- |
| Property + variant | `StatusFlat`, `StatusIcon`, `SelectedFlat`     |
| Feature + modifier | `OpenDelay`, `DynamicTrigger`, `ScrollContent` |
| Concept + variant  | `GroupStatus`, `FormSubmit`, `FormControl`     |
| Layout variants    | `VerticalTabs`, `BorderlessTabs`               |

#### Special Prefixes

| Prefix    | Usage                                            | Examples                                 |
| --------- | ------------------------------------------------ | ---------------------------------------- |
| `Legacy`  | Deprecated patterns                              | `LegacyTrigger`, `LegacyBehaviorTrigger` |
| `Invalid` | Anti-patterns                                    | `InvalidLinkButton`                      |
| `Valid`   | Correct patterns (when contrasting with invalid) | `ValidLinkButton`                        |

#### What to Avoid

- ❌ **Component names in titles**: Use `Status` not `BadgeStatus`
- ❌ **Implementation details**: Use `ScrollContent` not `OverflowAutoScrollContent`
- ❌ **Vague names**: Use `DynamicTrigger` not `Example1`
- ❌ **Overly long names**: Keep to 3 words max

#### Examples

```typescript
// ✅ Good: Clear, semantic names
export const Default = { /* ... */ };
export const Status = { /* ... */ };
export const StatusFlat = { /* ... */ };
export const FormSubmit = { /* ... */ };

// ❌ Bad: Component name in title
export const BadgeDefault = { /* ... */ };
export const BadgeStatus = { /* ... */ };

// ❌ Bad: Too verbose or unclear
export const Example1 = { /* ... */ };
export const TestCase = { /* ... */ };
export const DefaultBadgeWithStatusColors = { /* ... */ };
```

When the build produces examples for API consumption, it automatically attaches extra metadata such as the associated element/component reference and a UUID to ensure each example has a unique identifier across all projects.

### Use `@summary` JSDoc Comments

Every example **must** include a `@summary` JSDoc comment that explains:

- Descriptions must be concise one or two sentences only.
- **What** the example demonstrates
- **Why** this pattern is useful
- **When** to use this approach
- **How** it improves the user experience

**When appropriate use NVIDIA or NVIDIA Autonomous Vehicle program for UX use cases**

```typescript
/**
 * @summary Basic badge component with default styling. Use for simple non-interactive labels or status indicators.
 */
export const Default = {
  render: () => html`<nve-badge>badge</nve-badge>`
};
```

<nve-alert status="warning">Limit summaries to a max of 400 characters. This restriction ensures the documentation stays portable across all platforms including docs, CLI and MCPs.</nve-alert>

### Stateless Examples by Default

Examples should be stateless when possible, focusing on demonstrating the component's capabilities rather than complex interactions:

```typescript
export const Status = {
  render: () => html`
    <div nve-layout="row gap:xs">
      <nve-badge status="scheduled">scheduled</nve-badge>
      <nve-badge status="queued">queued</nve-badge>
      <nve-badge status="pending">pending</nve-badge>
    </div>
  `
};
```

### Use Plain HTML/CSS/JS

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
 * @summary Status badges with predefined colors for different states.
 * Ideal for showing job status, task progress, or system states.
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
 * @summary [Summary of the pattern,
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

## Summary Writing Guidelines

### Good Summaries

- **Specific and actionable**: "Use for simple non-interactive labels or status indicators"
- **Context-aware**: "Ideal for showing job status, task progress, or system states"
- **UX-focused**: "Perfect for dense layouts or when you want less visual weight"
- **Accessibility-conscious**: "using aria-label for accessibility"

### Summary Structure

1. **Opening**: What the example demonstrates
2. **Context**: When/why to use this pattern
3. **Benefits**: How it improves UX or solves problems
4. **Technical notes**: Any important implementation details

### Examples of Well-Written Summaries

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

### Avoid Poor Summaries or Unclear Use Cases

Summaries should provide UX intent. Do not describe what the reader can already infer from the source code.

```typescript
/**
 * @summary Default badge example.
 */

/**
 * @summary Badge examples with status colors.
 */
```

### Avoid Overly Complex State

Avoid complex/stateful examples. Use cases vary widely across frameworks/tools so simple stateless examples are necessary to support all users.

```typescript
export const OverlyComplex = {
  render: () => html`<!-- Complex state logic that obscures the example -->`
};
```

## Best Practices Summary

1. **Always include `@summary`** - Every example needs clear documentation
2. **Keep examples stateless** - Focus on component capabilities, not complex interactions
3. **Use plain HTML/CSS/JS** - Avoid unnecessary abstractions
4. **Write descriptive summaries** - Explain what, why, when, and how
5. **Include accessibility notes** - Use ARIA attributes when appropriate
6. **Provide context** - Explain the UX benefits and use cases
7. **Keep examples focused** - One clear concept per example
8. **Use semantic naming** - Example names should show their purpose

## Example Checklist

Before submitting an example, ensure:

- [ ] Example includes a title
- [ ] `@summary` JSDoc comment is present and comprehensive
- [ ] Description explains the UX intent and use cases
- [ ] Example is stateless (unless demonstrating specific state patterns)
- [ ] Uses plain HTML/CSS/JS without unnecessary abstractions
- [ ] Includes accessibility considerations when relevant

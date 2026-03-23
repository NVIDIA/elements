---
{
  title: 'Component Creation',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

This guide covers creating new components in the Elements library with all required files and conventions.

## File Structure

Every component requires 10 files following this naming pattern:

```html
component-name/
├── component-name.ts              # Main component class
├── component-name.css             # Component styles
├── component-name.examples.ts     # Example templates
├── component-name.test.ts         # Unit tests
├── component-name.test.axe.ts     # Accessibility tests
├── component-name.test.lighthouse.ts  # Performance tests
├── component-name.test.visual.ts  # Visual regression tests
├── component-name.test.ssr.ts     # Server-side rendering tests
├── define.ts                      # Custom element registration
└── index.ts                       # Export (no side effects)
```

## Component Class (component-name.ts)

### Base Classes

Choose the appropriate base class:

- **BaseButton** - For button-like interactive components
- **LitElement** - For stateless or simple components

```typescript
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './component-name.css?inline';

/**
 * @element nve-component-name
 * @description Brief component description.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/core/component-name
 * @slot - default slot description
 * @cssprop --background
 * @cssprop --color
 * @aria https://...
 */
export class ComponentName extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-component-name',
    version: '0.0.0'
  };

  /**
   * Property description.
   */
  @property({ type: String, reflect: true }) status?: 'success' | 'error';

  render() {
    return html`
      <div internal-host>
        <slot></slot>
      </div>
    `;
  }
}
```

### Required JSDoc Tags

- `@element` - Component tag name
- `@description` - What the component does
- `@since` - Version when added (use 0.0.0 for new)
- `@entrypoint` - Import path
- `@slot` - Slot descriptions (required only when the component exposes one or more slots)
- `@cssprop` - CSS custom properties
- `@aria` - ARIA pattern reference (optional)

### Metadata Object

Always include metadata with exact tag name and version:

```typescript
static readonly metadata = {
  tag: 'nve-component-name',
  version: '0.0.0'
};
```

## Registration (define.ts)

Use the `define()` helper and declare global types:

```typescript
import { define } from '@nvidia-elements/core/internal';
import { ComponentName } from '@nvidia-elements/core/component-name';

define(ComponentName);

declare global {
  interface HTMLElementTagNameMap {
    'nve-component-name': ComponentName;
  }
}
```

## Export (index.ts)

Export the component class without side effects:

```typescript
export * from './component-name.js';
```

## Styles (component-name.css)

Use CSS custom properties for theming:

```css
:host {
  display: inline-block;
  background: var(--background, var(--nve-color-surface-base));
  color: var(--color, var(--nve-color-text-primary));
}
```

## Examples (component-name.examples.ts)

Follow the [examples guideline](examples.md) for naming and structure:

```typescript
import { html } from 'lit';

/**
 * @summary Basic component with default styling.
 */
export const Default = {
  render: () => html`<nve-component-name>content</nve-component-name>`
};

/**
 * @summary Shows status variants for different states.
 */
export const Status = {
  render: () => html`
    <div nve-layout="column gap:sm">
      <nve-component-name status="success">Success</nve-component-name>
      <nve-component-name status="error">Error</nve-component-name>
    </div>
  `
};

export default {
  title: 'Elements/ComponentName',
  component: 'nve-component-name'
};
```

## Test Files

### Unit Tests (component-name.test.ts)

Follow the [unit testing guideline](testing-unit.md):

```typescript
import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { ComponentName } from '@nvidia-elements/core/component-name';
import '@nvidia-elements/core/component-name/define.js';

describe(ComponentName.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ComponentName;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<nve-component-name>content</nve-component-name>`
    );
    element = fixture.querySelector(ComponentName.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(ComponentName.metadata.tag)).toBeDefined();
  });

  it('should reflect status property', async () => {
    element.status = 'success';
    await elementIsStable(element);
    expect(element.getAttribute('status')).toBe('success');
  });
});
```

### Accessibility Tests (component-name.test.axe.ts)

Follow the [accessibility testing guideline](testing-accessibility.md):

```typescript
import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture, runAxe } from '@nvidia-elements/testing';
import { ComponentName } from '@nvidia-elements/core/component-name';
import '@nvidia-elements/core/component-name/define.js';

describe(ComponentName.metadata.tag, () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-component-name>content</nve-component-name>
      <nve-component-name status="success">success</nve-component-name>
    `);
    await elementIsStable(fixture.querySelector(ComponentName.metadata.tag));
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([ComponentName.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
```

### Visual Tests (component-name.test.visual.ts)

Follow the [visual testing guideline](testing-visual.md):

```typescript
import { describe, test, expect } from 'vitest';
import { visualRunner } from '@nve-internals/vite';

describe('component-name visual', () => {
  test('should match visual baseline', async () => {
    const report = await visualRunner.render('component-name', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('component-name.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/component-name/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <nve-component-name>Default</nve-component-name>
    <nve-component-name status="success">Success</nve-component-name>
  `;
}
```

### SSR Tests (component-name.test.ssr.ts)

Follow the [SSR testing guideline](testing-ssr.md):

```typescript
import { html } from 'lit';
import { describe, it, expect } from 'vitest';
import { ssrRunner } from '@nve-internals/vite';
import { ComponentName } from '@nvidia-elements/core/component-name';

describe(ComponentName.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(
      html`<nve-component-name>content</nve-component-name>`
    );
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-component-name')).toBe(true);
  });
});
```

### Lighthouse Tests (component-name.test.lighthouse.ts)

Follow the [lighthouse testing guideline](testing-lighthouse.md):

```typescript
import { describe, test, expect } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('component-name lighthouse report', () => {
  test('should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-component-name', `
      <nve-component-name>content</nve-component-name>
      <script type="module">
        import '@nvidia-elements/core/component-name/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(15); // Adjust based on actual size
  });
});
```

## Checklist

When creating a new component, ensure:

- [ ] All 10 files created with correct naming
- [ ] Component class extends appropriate base class
- [ ] JSDoc comments complete with all required tags
- [ ] Metadata object includes tag and version
- [ ] Properties use `@property` decorator with correct options
- [ ] Properties that reflect use `reflect: true`
- [ ] CSS custom properties defined and documented
- [ ] Registration in define.ts with global type declaration
- [ ] Examples follow naming conventions with `@summary` tags
- [ ] All 5 test types implemented (unit, axe, visual, ssr, lighthouse)
- [ ] Tests use proper fixture setup/cleanup patterns
- [ ] TypeScript follows [type safety guidelines](typescript.md)

## Reference Components

Study these complete examples:

- `/projects/core/src/button/` - BaseButton pattern, interactive component
- `/projects/core/src/badge/` - LitElement pattern, simple component
- `/projects/core/src/card/` - Composition pattern with slots

## Related Guidelines

- [TypeScript Guidelines](typescript.md) - Type safety patterns
- [Examples Guidelines](examples.md) - Example naming and structure
- [Testing Guidelines](testing.md) - Testing strategy overview
- [API Design - Properties & Attributes](../api-design/properties-attributes.md) - Property design
- [API Design - Styles](../api-design/styles.md) - CSS custom properties
- [API Design - Registration](../api-design/registration.md) - Naming conventions

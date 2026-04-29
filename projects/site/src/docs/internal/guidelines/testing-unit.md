---
{
  title: 'Unit Testing',
  description: 'Internal guidelines: write unit tests for NVIDIA Elements components using createFixture, elementIsStable, and untilEvent helpers.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Basic functionality tests using Vitest and `@internals/testing` utilities.

**Key Patterns:**

- Use `createFixture` and `removeFixture` for DOM setup/teardown
- Wait for element stability with `elementIsStable`
- Test element definition, properties, attributes, and events

**Example:**

```typescript
import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Badge } from '@nvidia-elements/core/badge';
import '@nvidia-elements/core/badge/define.js';

describe(Badge.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Badge;

  beforeEach(async () => {
    fixture = await createFixture(html`<nve-badge>label</nve-badge>`);
    element = fixture.querySelector(Badge.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Badge.metadata.tag)).toBeDefined();
  });
});
```

## Testing Utilities

### @internals/testing

Core testing utilities for DOM manipulation and element stability:

- `createFixture`: Creates test fixture DOM element
- `removeFixture`: Removes test fixture DOM
- `elementIsStable`: Waits for Lit element to be stable
- `emulateClick`: Triggers native click events
- `untilEvent`: Creates promise for event results

## Running Tests

Run test scripts from the root directory of the project where the `package.json` lives.

```shell
# run all tests
pnpm run test

# run single test suite
pnpm run test -- src/badge/badge.test.ts
```

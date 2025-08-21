---
{
  title: 'Unit Testing',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Basic functionality tests using Vitest and `@nvidia-elements/testing` utilities.

**Key Patterns:**

- Use `createFixture` and `removeFixture` for DOM setup/teardown
- Wait for element stability with `elementIsStable`
- Test element definition, properties, attributes, and events

**Example:**

```typescript
import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
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
# run all tests
pnpm run test

# run single test suite
pnpm run test -- src/badge/badge.test.ts
```

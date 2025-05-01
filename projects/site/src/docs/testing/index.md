---
{
  title: 'Testing',
  layout: 'docs.11ty.js'
}
---

# Testing

Elements has a small set of testing utilities for unit testing Lit based
Custom Elements. These utilities are used to test the elements but also are
available for external use. The testing utilities can be found at the following entrypoint:

```shell
# add internal registry to local .npmrc file
registry=https://registry.npmjs.org
```

```typescript
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
```

Below is a basic test setup for a Lit Web Component. This test was written using [Vitest](https://vitest.dev/). The `createFixture` and `removeFixture` functions will create a DOM element to mount the custom element, as well as remove that element once the test has completed.

```typescript
import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { Icon, IconVariants } from '@nvidia-elements/core/icon';
import '@nvidia-elements/core/icon/define.js';

describe('nve-icon', () => {
  let fixture: HTMLElement;
  let element: Icon;

  beforeEach(async () => {
    fixture = await createFixture(html`<nve-icon></nve-icon>`);
    element = fixture.querySelector('nve-icon');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-icon')).toBeDefined();
  });
});
```

When updating properties on a lit element you can use the `elementIsStable` function to wait for the element to update/render the changes to the template. Setting a property on an element will often trigger multiple renders of that template. The `elementIsStable` function will wait for pending updates to complete.

```typescript
it('should reflect name attribute for CSS selectors', async () => {
  expect(element.name).eq(undefined);
  element.name = 'book';
  await elementIsStable(element);
  expect(element.getAttribute('name')).toBe('book');
});
```

## Testing Environment

If you use a testing Environment that uses a DOM mocking such as [happy-dom](https://github.com/capricorn86/happy-dom) or [js-dom](https://github.com/jsdom/jsdom) then you will likely need to import the bundled polyfills to enable the elements to work in the testing environment. Currently this bundle pulls in the `ElementInternals` API which is not yet supported in these testing environments.

```typescript
import '@nvidia-elements/core/polyfills';
```

---
{
  title: 'Extensions',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% integration 'extensions' %}

{% installation 'extensions' %}

To create reusable UI components that build on top of Elements, consider using [lit.dev](https://lit.dev) for authoring highly reusable custom elements (Web Components). This path enables your extensions to work in a large variety of frameworks and environments. Read the [publishing and best practices](https://lit.dev/docs/tools/publishing/) provided by the lit team.
The rest of this guide focuses on how to integrate specifically for Element integration and best practices.

## Scoped Registry

By default Web Components, specifically the custom elements spec, defines elements on a global registry. This can introduce tag name collisions if the browser loads many versions of the same library. To avoid this, use a [scoped registry](https://developer.chrome.com/blog/scoped-registries). This allows you to define your own registry and ensure the Elements you depend on are only registered to the scope of your component and not the global registry.

```typescript
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { Input } from '@nvidia-elements/core/input';
import { Password } from '@nvidia-elements/core/password';
import { Button } from '@nvidia-elements/core/button';

const libraryRegistry =
  globalThis.CustomElementRegistry && 'initialize' in CustomElementRegistry.prototype
    ? new CustomElementRegistry()
    : customElements;

@customElement('domain-login')
export class DomainLogin extends LitElement {
  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    customElementRegistry: libraryRegistry
  };

  constructor() {
    super();
    libraryRegistry.get('domain-login') || libraryRegistry.define('domain-login', DomainLogin);
    libraryRegistry.get('nve-input') || libraryRegistry.define('nve-input', Input);
    libraryRegistry.get('nve-password') || libraryRegistry.define('nve-password', Password);
    libraryRegistry.get('nve-button') || libraryRegistry.define('nve-button', Button);
  }

  render() {
    return html`
      <nve-input>
        <label>Email</label>
        <input type="email" />
      </nve-input>

      <nve-password>
        <label>Password</label>
        <input type="password" />
      </nve-password>

      <nve-button interaction="emphasis">Login</nve-button>
    `;
  }
}
```

```typescript
// define.ts
import { DomainLogin } from './login.js';

// register the component globally for your users to import and consume
customElements.get('domain-login') || customElements.define('domain-login', DomainLogin);

declare global {
  interface HTMLElementTagNameMap {
    ['domain-login']: DomainLogin;
  }
}
```

```typescript
// internal/index.ts

// shared private registry for all of the library sub dependencies/components
export const libraryRegistry =
  globalThis.CustomElementRegistry && 'initialize' in CustomElementRegistry.prototype
    ? new CustomElementRegistry()
    : customElements;

export function define(
  tag: string,
  element: CustomElementConstructor,
  registry: CustomElementRegistry = customElements
) {
  registry.get(tag) || registry.define(tag, element);
}
```

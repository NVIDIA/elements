---
{
  title: 'Extensions',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

<div nve-layout="row gap:xs">
  <nve-button>
    <nve-icon name="download" size="sm"></nve-icon>
    <a href="https://NVIDIA.github.io/elements/starters/download/scoped-registry.zip" target="_blank">Download</a>
  </nve-button>

  <nve-button>
    <nve-icon name="code"></nve-icon>
    <a href="https://github.com/NVIDIA/elements/-/tree/main/projects/starters/scoped-registry" target="_blank">Source</a>
  </nve-button>
</div>

To create reusable UI components that build on top of Elements we recommend using [lit.dev](https://lit.dev) for authoring highly reusable custom elements (Web Components).
This path enables your extensions to work in a large variety of frameworks and environments. We recommend
reading the [publishing and best practices](https://lit.dev/docs/tools/publishing/) provided by the lit team.
The rest of this guide will focus on how to integrate specifically for Element integration and best practices.

## Scoped Registry

By default Web Components, specifcally the custom elements spec, defines elements on a global registry.
This can introduce tag name collisions if multiple versions of the same library are loaded. To avoid this
we recommend using a scoped registry. This allows you to define your own registry and ensure the Elements you
depend on are only registered to the scope of your component and not the global registry.

The lit team provides the `@lit-labs/scoped-registry-mixin` package which provides a mixin that can be used to
create a scoped registry based on the in progress [Scoped Custom Element Registries](https://github.com/webcomponents/polyfills/tree/master/packages/scoped-custom-element-registry) spec.

```typescript
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { scope } from '@nvidia-elements/core/scoped';
import { Input } from '@nvidia-elements/core/input';
import { Password } from '@nvidia-elements/core/password';
import { Button } from '@nvidia-elements/core/button';
import '@webcomponents/scoped-custom-element-registry';

@customElement('domain-login')
export class DomainLogin extends ScopedRegistryHost(LitElement) {
  static elementDefinitions = {
    'nve-input': scope(Input, ScopedRegistryHost),
    'nve-password': scope(Password, ScopedRegistryHost),
    'nve-button': scope(Button, ScopedRegistryHost)
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

The static `elementDefinitions` property is used to define the elements that will be registered to the scoped registry.
The `scope` function is used to wrap the element definition with the `ScopedRegistryHost` mixin. This is required to ensure
all Elements in the entire DOM tree are registered to the scoped registry. Once completed the `domain-login` component
can be used in any framework that supports Web Components.

---
{
  title: 'Composition',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## API Inheritance - anti-pattern

Elements should default to using composition when possible. This approach is to maximize flexibility, compatibility and API simplicity. API inheritance is when an API unknowingly or over time inherits or re-implements another element's API on its own to expose additional access to its otherwise internal implementation details. Example, using a button and icon element we can start to see some of these tradeoffs.

<nve-alert status="danger">Don't:</nve-alert>

```html
<nve-button icon="info">
  button
</nve-button>
```

<nve-alert status="success">Do:</nve-alert>

```html
<nve-button>
  button <nve-icon name="info"></nve-icon>
</nve-button>
```

It may be tempting to encapsulate other elements and expose their APIs to the host element. This can make the API seem more terse and less code to write. For example, if a button has an icon we may want to provide an icon `name` API to set the button icon. However this quickly can run into API conflicts. First we conflict with the native button API which has an existing name attribute so the icon must be exposed via `icon`.

Going further we run into layout conflicts. If the icon needs to change position we must provide a secondary “escape hatch” API to change this behavior.

<nve-alert status="danger">Don't:</nve-alert>

```html
<nve-button iconplacement="leading" icon="info">
  button
</nve-button>
```

<nve-alert status="success">Do:</nve-alert>

```html
<nve-button>
  <nve-icon name="info"></nve-icon> button
</nve-button>
```

While this works it's introducing “escape hatch” APIs that the button now must support for the use of the icon. These situations can also complicate internationalization use cases where reading order and elements are reversed for right-to-left languages.

As the icon API grows over time so will the pressure for the button API to absorb and expose additional API endpoints for the icon. This pressure is “API inheritance” which creates tightly coupled and non-explicit APIs that only exist for certain element usage/combinations. As a result, the API becomes more complex (and verbose) as more escape hatches are required. In this example, the first API leads to the use of 67 chars vs the composition API at 65 chars. By leveraging composition and slots we can avoid supporting escape hatch/tightly coupled APIs which long term keeps the supported API surface area smaller and easier to learn.

## Default Slots and Customization

Reasonable defaults of an element should be provided for better developer experience for consumers of the library and the end user. Sometimes however the defaults themselves need to be customized. For example, an alert message may show various status types such as success, warning and danger. Each may show a different icon within that box by default.

```html
<nve-alert status="success" closable>
  hello there
</nve-alert>
```

The alert can internally provide the default icon style for the status in the system. But as above with the button, we run the risk of the alert element absorbing parts of the icon API. To mitigate this, leveraging default slots can provide a hook for customizations.

```html
<!-- nve-alert template -->
<div>
  <slot name="icon">
    <nve-icon name=${this.status}></nve-icon>
  </slot>
  <slot></slot>
</div>

<!-- consumer API -->
<nve-alert status="warning">
  <nve-icon slot="icon" name="custom-icon"></nve-icon>
  hello there
</nve-alert>
```

Slots can provide default content if no content is provided. Here we set an internal icon with a status icon that matches the status of the alert. If the consumer wants to customize the icon, they can do so by projecting their own icon into the icon slot, overriding the default. This enables full control of the custom icon being provided without the alert needing to expose the icon through a series of API inherited attributes/properties. As with all API choices there are tradeoffs.

## Semantic Obfuscation - anti-pattern

When building composition based APIs the semantics of the HTML should be pushed up into the light DOM or the control of the consumer. In this example the h1 heading is embedded into the card element. This creates an incorrect DOM structure as only one given h1 can exist within the page. This also applies as the page structure should work down from h1-h6.

<nve-alert status="danger">Don't:</nve-alert>

```html
<!-- nve-card template -->
<div>
  <h1><slot name="header"></slot></h1>
  <div>
  	<slot></slot>
  </div>
  <slot name="footer"></slot>
</div>

<!-- consumer API -->
<nve-card status="warning">
  <div slot="header">Card Header</div>
  <p>card content</p>
</nve-card>
```

<nve-alert status="success">Do:</nve-alert>

```html
<!-- nve-card template -->
<div>
  <slot name="header"></slot>
  <div>
  	<slot></slot>
  </div>
  <slot name="footer"></slot>
</div>

<!-- consumer API -->
<nve-card status="warning">
  <h2 slot="header">Card Header</h2>
  <p>card content</p>
</nve-card>
```

While composition based APIs may be more verbose at times, they lower the overall API surface area to learn in the system and help ensure there is a singular way to use the element. Once a consumer learns an element API, that API usage remains predictable and reliable throughout the system.

Opinionated abstractions can be added within consumer apps/plugins. This can provide a more opinionated terse API in which consumers can always “escape” or access the elements of the base library as needed. It's easier to add abstraction layers, it's much more difficult to pull apart the wrong base abstraction.

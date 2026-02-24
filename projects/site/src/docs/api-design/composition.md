---
{
  title: 'Composition',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## API Inheritance - anti-pattern

Elements should default to using composition when possible. This approach is to maximize flexibility, compatibility, and API simplicity. API inheritance is when an API unknowingly or over time inherits or re-implements another element's API on its own to expose extra access to its otherwise internal implementation details. Example, using a button and icon element it's possible to start to see some of these tradeoffs.

{% dodont %}

```html
<nve-button>
  button <nve-icon name="info"></nve-icon>
</nve-button>
```

```html
<nve-button icon="info">
  button
</nve-button>
```

{% enddodont %}

It may be tempting to encapsulate other elements and expose their APIs to the host element. This can make the API seem more terse and less code to write. For example, if a button has an icon it may seem useful to provide an icon `name` API to set the button icon. But this quickly can run into API conflicts. First this conflicts with the native button API which has an existing name attribute so the developer must expose the icon via `icon`.

Going further this runs into layout conflicts. If the icon needs to change position the developer must add a secondary “escape hatch” API to change this behavior.

{% dodont %}

```html
<nve-button>
  <nve-icon name="info"></nve-icon> button
</nve-button>
```

```html
<nve-button iconplacement="leading" icon="info">
  button
</nve-button>
```

{% enddodont %}

While this works it's introducing “escape hatch” APIs that the button now must support for the use of the icon. These situations can also complicate internationalization use cases where right-to-left languages reverse reading order and elements.

As the icon API grows over time so does the pressure for the button API to absorb and expose more API endpoints for the icon. This pressure is “API inheritance” which creates tightly coupled and non-explicit APIs that only exist for certain element usage/combinations. As a result, the API becomes more complex (and verbose) as it demands more escape hatches. In this example, the first API leads to the use of 67 chars vs the composition API at 65 chars. By leveraging composition and slots it's possible to avoid supporting escape hatch/tightly coupled APIs which long term keeps the supported API surface area smaller and easier to learn.

## Default Slots and Customization

Elements should provide reasonable defaults for better developer experience for consumers of the library and the end user. Sometimes consumers need to customize the defaults themselves. For example, an alert message may show status types such as success, warning, and danger. Each may show a different icon within that box by default.

```html
<nve-alert status="success" closable>
  hello there
</nve-alert>
```

The alert can internally provide the default icon style for the status in the system. But as above with the button, the alert element runs the risk of absorbing parts of the icon API. To mitigate this, leveraging default slots can provide a hook for customizations.

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

Slots can provide default content if the consumer supplies no content. Here the template sets an internal icon with a status icon that matches the status of the alert. If the consumer wants to customize the icon, they can do so by projecting their own icon into the icon slot, overriding the default. This enables full control of the custom icon the consumer provides without the alert needing to expose the icon through a series of API inherited attributes/properties. As with all API choices there are tradeoffs.

## Semantic Obfuscation - anti-pattern

When building composition based APIs the developer should push the semantics of the HTML up into the light DOM or the control of the consumer. In this example the card element embeds the h1 heading. This creates an incorrect DOM structure as only one given h1 can exist within the page. This also applies as the page structure should work down from h1-h6.

{% dodont %}

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

{% enddodont %}

While composition based APIs may be more verbose at times, they lower the API surface area to learn in the system and help ensure there is a singular way to use the element. Once a consumer learns an element API, that API usage remains predictable and reliable throughout the system.

Consumer apps/plugins can add opinionated abstractions. This can provide a more opinionated terse API in which consumers can always “escape” or access the elements of the base library as needed. It's easier to add abstraction layers, it's much more difficult to pull apart the wrong base abstraction.

---
{
  title: 'Logs & Warnings',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

This document describes the various runtime logs and warnings from the Element libraries. These warnings help identify potential issues with component usage and implementation.

## Duplicate Package Version

This warning appears when multiple versions of Elements or its dependencies are bundled or imported within the same runtime. This can create unexpected compatibility issues and bug at runtime. To resolve, ensure dependencies are up to date and list their dependencies or peer dependencies if they internally depend on Elements.

<nve-alert status="accent">Read more about [library packaging best practices](docs/api-design/packaging/).</nve-alert>

## Excessive Instance Limit

This warning appears when too many instances of a component are rendered in the DOM. This can impact application performance. Common components that can have an excessive amount of instances include `nve-grid-row/cell` and `nve-tree-item`.

To resolve this warning:

- Consider reusing existing elements instead of creating new ones
- Implement virtualization or pagination of elements
- [Data Grid Performance Documentation](docs/elements/data-grid/performance/)
- [Dynamic Tree Documentation](docs/elements/tree/#dynamic-tree)

## Invalid Parent

This warning occurs when a component is used as a child of an unsupported parent element. Example a `nve-card-header` element can only be used as a direct child of `nve-card`.

<nve-alert status="success">Valid</nve-alert>

```html
<nve-card>
  <nve-card-header></nve-card-header>
</nve-card>
```

<nve-alert status="danger">Invalid</nve-alert>

```html
<div>
  <nve-card-header></nve-card-header>
</div>
```

To resolve this warning:

- Ensure the component is placed directly under the correct parent element
- Review the component's API for parent element requirements

## Invalid Slotted Children

This warning appears when invalid elements are slotted into a component. Example `nve-tree` and `nve-tree` have direct child relationships.

<nve-alert status="success">Valid</nve-alert>

```html
<nve-tree>
  <nve-tree-node></nve-tree-node>
</nve-tree>

<nve-grid-row>
  <nve-grid-cell></nve-grid-cell>
</nve-grid-row>
```

<nve-alert status="danger">Invalid</nve-alert>

```html
<nve-tree>
  <div>
    <nve-tree-node></nve-tree-node>
  </div>
</nve-tree>

<nve-grid-row>
  <div>
    <nve-grid-cell></nve-grid-cell>
  </div>
</nve-grid-row>
```

To resolve this warning:

- Check the component's documentation for allowed slotted elements
- Ensure only supported elements are placed in slots

## Use Element

This warning indicates that there may be a more appropriate element or non-deprecated element to use. This may include elements that have better semantic meaning and UX. Example slotting an anchor or button rather than a div or span element.

## ID Match Not Found

This warning appears when a component tries to reference an element by ID that doesn't exist in the DOM. Example a popover with a button trigger.

<nve-alert status="success">Valid</nve-alert>

```html
<nve-button popovertarget="my-popover">show tooltip</nve-button>
<nve-tooltip id="my-popover">tooltip</nve-tooltip>
```

<nve-alert status="danger">Invalid</nve-alert>

```html
<nve-button popovertarget="my-popover">show tooltip</nve-button>
<nve-tooltip id="incorrect-id">tooltip</nve-tooltip>
```

To resolve this warning:

- Ensure the referenced element exists in the DOM
- Check that the ID is spelled correctly
- Verify the element is rendered before the reference is made

## Cross Shadow Root Anchor

Native CSS Anchor Positioning allows two elements to be tethered together via a unique identifier. This is commonly used for popover-like elements. However CSS Anchor Positioning is limited to only positioning two elements in the same render root. Examples of rendering across render roots include in different Shadow Dom Roots or popover top layer instances. This behavior/compatibility issue is being tracked https://github.com/w3c/csswg-drafts/issues/9408.

Element popover positioning will detect instances of cross Shadow Root anchoring attempts and fallback to a JavaScript based positioning system. This will allow the popover to anchor correctly but at the cost of render reliability and performance when compared to native CSS Anchor Positioning.

## SSR Mismatch

This warning appears when there's a mismatch between server-side rendered content and client-side rendered content.

<nve-alert status="accent"><a href="https://lit.dev/docs/ssr/overview/" nve-text="link">https://lit.dev/docs/ssr/overview/</a></nve-alert>

To resolve this warning:

- Ensure consistent rendering between server and client
- Check for conditional rendering that might differ between environments
- Verify that all required data is available during server-side rendering

## Invalid Padding Layout Utility

This warning appears when a component is using an invalid padding layout utility. Most custom elements have internalized styles via the Shadow DOM. This ensures they remain stable and predictable in applications as well as compatible with theming. Certain utility styles (such as padding) placed on the host Element can cause unexpected layout behavior of the element.

Layout styles and utilities should be focused on the layout and placement of elements on the page rather than modifying the internal styles of the element.

To resolve this warning:

- Use the CSS custom property `--padding` instead of layout utilities for element customizations
- Separate layout styles from component customization styles for more predictable layouts and theming

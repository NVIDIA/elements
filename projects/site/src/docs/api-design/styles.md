---
{
  title: 'Styles',
  description: 'Theming and styling guidelines for NVIDIA Elements: CSS custom properties, parts, themes, and composing a design language on top of components.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## Strategies

Three primary strategies control or adjust the look and feel of the system, each with distinct trade-offs.

**Automatic (system)**: can adjust look/feel based on browser conditions with high confidence. For example, CSS container or style queries can report accurate states of the current UI.

- relative scales
- responsive elements

**Explicit (consumer dev/designer)**: low confidence the system can predict precise usage but high confidence by the consumer developer/designer. These cases are context specific. For example, when to use a small button in a toolbar vs a large button for a call to action.

- size properties/variants
- status properties/variants
- CSS custom property overrides

**Theme (user)**: system nor the consumer dev/designer can predict users preferences. For example, user has system OS defined preferences or overrides for
light and dark themes or zoom/typography sizing.

- compact theme
- light/dark theme

## Custom Properties

Elements expose custom CSS properties that typically correspond to their native CSS properties, as shown in the table below. Some custom properties have no direct mappings to their native counterparts and the table indicates them by the absence of MDN documentation references.

<nve-grid>
  <nve-grid-header>
    <nve-grid-column>Name</nve-grid-column>
    <nve-grid-column>Description</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell>--background</nve-grid-cell>
    <nve-grid-cell>
      <a nve-text="link" target="_blank" rel="none" href="https://developer.mozilla.org/en-US/docs/Web/CSS/background">MDN Documentation</a>
    </nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>--gap</nve-grid-cell>
    <nve-grid-cell>
      <a nve-text="link" target="_blank" rel="none" href="https://developer.mozilla.org/en-US/docs/Web/CSS/gap">MDN Documentation</a>
    </nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell>--status-color</nve-grid-cell>
    <nve-grid-cell></nve-grid-cell>
  </nve-grid-row>
</nve-grid>

Prefer exposing shorthand values. `border: var(--border)` rather than `border-color: var(--border-color)` as this gives more flexibility to the user without expanding the public API surface. When possible keep CSS Custom Property names simple and map them 1:1 to the native CSS property. This lowers the learning curve of the API and makes it consistent between other components within the library.

{% dodont %}

```css
:host {
  --border: ...
  --padding: ...
  --background: ...
}
```

```css
:host {
  --border-color: ...
  --border-width: ...
  --padding-left: ...
  --padding-right: ...
  --background-color: ...
}
```

{% enddodont %}

## **_REMOVED_** Host

The internal host element is a pattern that provides an API guard on the element. When styling a custom element, avoid applying styles other than basic display properties and custom properties to the host element. The more styles applied to the host, the easier a consumer can override and change the styles in unexpected ways.

<nve-badge status="danger">Don't:</nve-badge>

```html
<!-- element internal template -->
<slot></slot>

<!-- element internal styles -->
<style>
  :host {
    --background: blue;
    --color: white;
    background: var(--background);
    color: var(--color);
    display: flex;
    flex-direction: column;
  }
</style>

<!-- consumer/application styles -->
<style>
  nve-card {
    /* bypassing custom css properties */
    background: red;

    /* possibly breaking component styles/layout */
    display: inline;
  }
</style>
```

In this example, the app may style the element in unsupported or unpredictable ways. Custom style leaks like this make visual changes or migrations difficult for both the library authors and consumers.

To prevent internal style leakage, leverage a internal host element to apply styles and expose only the styles as needed to the public facing API.

<nve-badge status="success">Do:</nve-badge>

```html
<!-- element internal template -->
<div internal-host>
  <slot></slot>
</div>

<!-- element internal styles -->
<style>
  :host {
    --background: blue;
    --color: white;
    display: block;
  }

  [internal-host] {
    /* customizable via the custom properties */
    background: var(--background);
    color: var(--color);

    /* internal and protected by shadow dom */
    display: flex;
    flex-direction: column;
  }
</style>
```

By scoping the background and color to the internal-host element, only the public API of the exposed CSS Custom Properties can change the look and feel of the element.

## State Properties

Use host selectors to customize an element's visual state. In this component stylesheet, each state updates the same custom properties.

<nve-badge status="success">Do:</nve-badge>

```css
:host {
  --background: var(--nve-sys-interaction-background);
  --border: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color);
  --color: var(--nve-sys-interaction-color);
}

[internal-host] {
  background: var(--background);
  border: var(--border);
  color: var(--color);
}

:host(:hover) {
  --background: var(--nve-sys-interaction-hover-background);
  --color: var(--nve-sys-interaction-hover-color);
}

:host([disabled]) {
  --background: var(--nve-sys-interaction-disabled-background);
  --color: var(--nve-sys-interaction-disabled-color);
}

:host([status='success']) {
  --background: var(--nve-sys-support-success-muted-color);
  --border: var(--nve-ref-border-width-sm) solid var(--nve-sys-support-success-emphasis-color);
}

:host([status='danger']) {
  --background: var(--nve-sys-support-danger-muted-color);
  --border: var(--nve-ref-border-width-sm) solid var(--nve-sys-support-danger-emphasis-color);
}
```

By modifying only a single set of Custom Properties the CSS specificity stays low and ensures that developers can theme any combination of visual states within the predictable public API.

With custom elements, the element tag is the scope for the design tokens. Element-specific design tokens are unnecessary and increase the surface area of the API and number of tokens to maintain.

```css
nve-card.product-custom:hover {
  --background: var(--nve-sys-layer-container-accent-background);
  --border: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-emphasis);
}
```

Visual customizations and theming are now fully compatible throughout the public API of the CSS custom properties.

<nve-badge status="danger">Don't:</nve-badge>

```css
:host {
  background: var(--nve-sys-interaction-background);
  border: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color);
  color: var(--nve-sys-interaction-color);
}

:host(:hover) {
  background: var(--nve-sys-interaction-hover-background);
  color: var(--nve-sys-interaction-hover-color);
}

:host([disabled]) {
  background: var(--nve-sys-interaction-disabled-background);
  color: var(--nve-sys-interaction-disabled-color);
}

:host([status='success']) {
  background: var(--nve-sys-support-success-muted-color);
  border: var(--nve-ref-border-width-sm) solid var(--nve-sys-support-success-emphasis-color);
}

:host([status='danger']) {
  background: var(--nve-sys-support-danger-muted-color);
  border: var(--nve-ref-border-width-sm) solid var(--nve-sys-support-danger-emphasis-color);
}
```

In this example the subtle change of not assigning to the default host properties not only increase the CSS specificity but also make certain customizations/theming impossible without exposing extra CSS custom properties.

## Design Tokens Usage

CSS Custom Properties defined on the host should use Design Tokens that appropriately describe the system's intent. CSS Custom Properties should not be explicitly named with the element name as this encourages inconsistency between elements rather than using the system's intent/purpose tokens. Leveraging State Properties for CSS custom properties, element specific design tokens are unnecessary and increase the surface area of the API and number of tokens to maintain. (see State Properties for more information)

{% dodont %}

```css
:host([status='danger']) {
  --background: var(--nve-sys-support-danger-color);
}

:host([status='success']) {
  --background: var(--nve-sys-support-success-color);
}
```

```css
:host([status='danger']) {
  background: var(--nve-sys-support-danger-color);
}

:host([status='success']) {
  background: var(--nve-sys-support-success-color);
}
```

{% enddodont %}

<nve-alert><nve-icon slot="icon" name="flag"></nve-icon> Performance: leveraging design tokens with defined intent drastically reduces the amount of CSS bundled and maintained within the system.</nve-alert>

## Element Style APIs

Style components using their supported attributes and custom states. Use `status="error"` for field validation, such as on `nve-input` or `nve-control-message`. Use `status="danger"` on `nve-alert` for critical messages.

`nve-accordion` exposes the `expanded` state for selectors such as `nve-accordion:state(expanded)`. Add the `expanded` attribute to start open and `behavior-expand` to let users toggle the accordion.

```html
<nve-accordion behavior-expand expanded>
  <nve-accordion-header>
    <h2 nve-text="heading xs medium">Workspace settings</h2>
  </nve-accordion-header>
  <nve-accordion-content>
    <p nve-text="body">Manage your workspace preferences.</p>
  </nve-accordion-content>
</nve-accordion>

<style>
  nve-accordion:state(expanded) {
    --background: var(--nve-sys-layer-container-accent-background);
  }
</style>
```

## Margins & Whitespace

Elements should not have any external margins or whitespace outside the bounds of the host element. Margins on a host element make assumptions about the layout that is external to their responsibility. A design token/layout system allows designers and developers to layout elements/utilities consistently and with explicit intent and constraint.

<nve-alert><nve-icon slot="icon" name="flag"></nve-icon> Performance: avoiding margins enables &nbsp;<a href="https://developer.chrome.com/blog/css-containment/">CSS containment for better performance</a></nve-alert>
<nve-alert><nve-icon slot="icon" name="academic-cap"></nve-icon> Learn: &nbsp;<a href="https://medium.com/microsoft-design/leading-trim-the-future-of-digital-typesetting-d082d84b202">leading trim</a></nve-alert>
<nve-alert><nve-icon slot="icon" name="academic-cap"></nve-icon> Learn about &nbsp;<a href="https://seek-oss.github.io/capsize/">Capsize CSS</a></nve-alert>

## Logical Properties

Use CSS Logical Properties when applying styles to text content that may invert with reading style. By using logical properties the styles follow the reading direction of the element. i18n support requires this
when the user preferences in the browser reverse the reading order.

<nve-alert><nve-icon slot="icon" name="academic-cap"></nve-icon> Learn about &nbsp;<a href="https://web.dev/logical-property-shorthands/">CSS Logical Properties</a></nve-alert>
<nve-alert><nve-icon slot="icon" name="academic-cap"></nve-icon> Case Study: &nbsp;<a href="https://storybook.core.clarity.design/?path=/docs/stories-forms--internationalization">example of inverted form controls </a></nve-alert>

## CSS Parts

CSS Parts let consumers style specific elements inside a component's shadow DOM. For example, `nve-dialog` exposes the `close-button` part when the dialog has the `closable` attribute.

```css
nve-dialog::part(close-button) {
  --color: var(--nve-sys-support-accent-emphasis-color);
}
```

<nve-alert status="warning">Warning: avoid using CSS Parts as they can drastically increase the API surface area of a element and can cause significant costs when updating visual changes in future versions.</nve-alert>

CSS Parts give full control to the application developer, but this comes with a significant tradeoff. As the element exposes more internal elements they become part of the public API of the element. Over time increases the difficulty of maintaining the API and making visual changes of the element without causing unexpected visual breaking changes to the consumer.

You can more safely expose elements that are part of the library's public API since each has its own well defined and versioned API. This safely gives more control to the application developer while preventing the element API surface from growing.

```html
<!-- nve-dialog internal template -->
<nve-icon-button part="close-button icon-button" icon-name="cancel" aria-label="Close dialog"></nve-icon-button>

<!-- consumer css -->
<style>
  nve-dialog::part(icon-button) {
    --color: var(--nve-sys-support-accent-emphasis-color);
  }
</style>
```

### Part Name Conventions

When naming a part use the name of the custom element without the `nve-` prefix for API consistency. When internal parts share a type, use both the general element name and a semantic name. This allows generalized selectors for theming as well as precise selections when needed.

```html
<nve-icon-button part="icon-button previous-icon-button" icon-name="chevron" direction="left" aria-label="Previous page"></nve-icon-button>
<nve-icon-button part="icon-button next-icon-button" icon-name="chevron" direction="right" aria-label="Next page"></nve-icon-button>
```

```css
nve-pagination::part(icon-button) {
  --color: var(--nve-sys-text-color);
}

nve-pagination::part(previous-icon-button) {
  --color: var(--nve-sys-text-muted-color);
}

nve-pagination::part(next-icon-button) {
  --color: var(--nve-sys-text-link-emphasis-color);
}
```

### Export Parts

<nve-alert status="warning">Due to higher maintenance complexity, use this API on a per-case basis.</nve-alert>

Use the [`exportparts` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/exportparts) to expose parts across nested shadow roots. The `nve-week` component exposes its calendar button as the `icon-button` part.

```html
<style>
  nve-week::part(icon-button) {
    --background: var(--nve-sys-interaction-highlighted-background);
  }
</style>
<nve-week>
  <label>Reporting week</label>
  <input type="week" />
</nve-week>
```

The calendar button exposes an `icon` part. In its internal template, `nve-week` uses `exportparts="icon:icon-button-icon"` on the icon button. Consumers can then select the icon by its exported name.

```css
nve-week::part(icon-button-icon) {
  --color: var(--nve-sys-text-link-emphasis-color);
}
```

{% example '@nvidia-elements/core/week/week.examples.json' 'ExportParts' %}

## Responsive

Elements should be responsive to support a wide variety of use cases. While not all apps are responsive, elements should be responsive to their parent element. This ensures that the element properly renders in any context, regardless if the element is in a datagrid, dashboard, or article content. Leverage APIs like ResizeObserver and in the future Container Queries to achieve this.

## Performance &amp; Imports

You can extract and import component specific styles from a separate CSS file.

```typescript
import { LitElement } from 'lit';
import { useStyles } from '@nvidia-elements/foundations/internal/styles';
import styles from './badge.css?inline';

export class Badge extends LitElement {
  static styles = useStyles([styles]);
}
```

Components should not import theme files or text/layout utilities. These stylesheets target global application level styles. Imports cause the styles to be inlined at runtime and create severe performance penalties to consumers of the component.

<nve-badge status="danger">Don't:</nve-badge>

```typescript
import theme from '@nvidia-elements/themes/index.css?inline';
import layout from '@nvidia-elements/styles/layout.css?inline';
import typography from '@nvidia-elements/styles/typography.css?inline';
```

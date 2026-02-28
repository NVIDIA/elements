---
{
  title: 'Properties & Attributes',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Properties/attributes represent an element's visual state. Examples:

- _types_ `status: error | success | warning`
- _states_ `expanded | selected | disabled`
- _behaviors_ `closable | draggable`

```html
<nve-alert status="success"></nve-alert>
```

Properties (`@property`) in Lit enable setting the property on the element via JavaScript or HTML Attributes.

```html
<nve-alert status="success"></nve-alert>

<script type="module">
  const alert = document.querySelector('nve-alert');
  alert.status = 'warning';
</script>
```

<nve-alert>
  <nve-icon slot="icon">🎓</nve-icon> 
  <p nve-text="body">Learn: by default when you set a property, Lit does not update the corresponding attribute in the DOM for performance. If the attribute serves as a style hook example, <code nve-text="code">:host([disabled])</code> then you can add the <code nve-text="code">reflect</code> option to the property decorator.</p>
</nve-alert>

## Impossible states

Properties/Attributes should avoid enabling “impossible states”. Conflicting APIs on a single element cause impossible states.

{% dodont %}

```html
<nve-alert status="success">hello there</nve-alert>
```

```html
<nve-alert info>hello there</nve-alert>
<nve-alert success>hello there</nve-alert>
<nve-alert warning>hello there</nve-alert>
<nve-alert danger>hello there</nve-alert>

<!-- alert cannot be in a success and error state -->
<nve-alert success danger>hello there</nve-alert>
```

{% enddodont %}

<nve-alert><nve-icon slot="icon">🎓</nve-icon> Learn:&nbsp;<a href="https://kentcdodds.com/blog/make-impossible-states-impossible" nve-text="link">make impossible states impossible</a></nve-alert>

## Boolean Types

Boolean property/attribute type behave the same as native HTML element boolean types. The presence of the attribute is truthy and absence of the attribute is falsy. ([MDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden))

```html
<nve-alert closable>hello there</nve-alert>
```

<nve-alert status="warning">
  Warning: avoid double negations on attributes as this breaks the default expectations of native HTML elements, examples (<code nve-text="code">disable-closable</code>, <code nve-text="code">not-closable</code>, <code nve-text="code">closable=”false”</code>)
</nve-alert>

<nve-alert status="warning">
  Warning: supporting React requires a custom coercion function that sets boolean attributes to a value of “false” <a href=”https://github.com/vmware-clarity/core/blob/main/projects/core/src/internal/utils/dom.ts#L268” nve-text=”link”>example</a> <a href=”https://github.com/facebook/react/issues/9230” nve-text=”link”>React issue</a>.
</nve-alert>

## Primitive Types

<nve-alert status="accent">Note: primitive type guidance is for atomic and highly reusable element libraries</nve-alert>

While Lit keeps both properties and attributes in sync, do not use complex types like `object` and `array` on the API. Since HTML cannot represent JavaScript objects, Lit must JSON parse attributes and reflect them anytime there is a change to ensure the JavaScript property and HTML attribute are in sync. This can be expensive to parse when using an object or array and cause unexpected behaviors such as lost object references for the user.

<nve-alert status="success">
  Use <code>string | number | boolean</code>
</nve-alert>

<nve-alert status="danger">
  Avoid <code>object | array</code>
</nve-alert>

Complex types cause compatibility and usability issues as it can require the developer to use JavaScript to render content. This can make it difficult for user-generated content like CMS systems or SSR (Server Side Rendering) to easily render static HTML.

<nve-alert status="warning">
  Warning: avoid using <code>@property</code> on built in properties/attributes on the <code>HTMLElement</code> as the decorator overrides the getter/setter and can cause unexpected behavior.&nbsp;<a href="https://github.com/vmware-clarity/core/blob/main/projects/core/build/eslint-rules/reserved-property-names.js" nve-text="link">read more</a>
</nve-alert>

<nve-alert><nve-icon slot="icon">🎓</nve-icon>
Learn about <a href="https://developers.google.com/web/fundamentals/web-components/best-practices#attributes-properties" nve-text="link">Web Fundamentals Attributes vs Properties</a>.
</nve-alert>

## Data Elements

Some components exist as a representational view of a pure data structure that cannot be meaningfully distilled into primitive attributes or expressed declaratively as HTML child elements. In these cases a complex type property is acceptable.

A component qualifies as a Data Element when **all** the following are true:

1. The component renders a **data structure** (arrays, series, matrices) rather than composable UI content.
2. The data **is not representable** using a reasonable number of primitive attributes or slotted children.
3. The component is a **leaf node** -- it does not compose other application-level elements.

```html
<!-- sparkline plots a numeric series — no sensible way to express this as attributes or children -->
<nve-sparkline data="[14, 18, 17, 20, 19, 24, 21]"></nve-sparkline>
```

Components that meet this criteria should implement the `DataElement` interface so the pattern is consistent and discoverable across the library.

```typescript
/** An element that implements a representational view of complex data. */
export interface DataElement<T extends unknown[] | Record<string, unknown>> {
  data?: T;
}
```

The `data` property should use Lit's `@property` decorator **without** the `reflect` option to avoid serializing large structures back to the DOM attribute.

```typescript
export class Sparkline extends LitElement implements DataElement<number[]> {
  @property({ type: Array }) data?: number[];
}
```

{% dodont %}

```html
<!-- data element: the series is a pure data structure with no declarative alternative -->
<nve-sparkline data="[14, 18, 17, 20, 19, 24, 21]"></nve-sparkline>
```

```html
<!-- alert content is composable UI — use primitives and slots instead -->
<nve-alert data='{"status":"success","message":"hello"}'>
</nve-alert>
```

{% enddodont %}

<nve-alert status="warning">
  <p nve-text="relaxed">
    Warning: only use <code>DataElement</code> for data structures that have no reasonable declarative HTML representation. If primitive attributes, slots, or child elements can represent the content, prefer those approaches.
  </p>
</nve-alert>

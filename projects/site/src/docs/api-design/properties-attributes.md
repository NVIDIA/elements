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

Properties (`@property`) in lit enables the property to be set on the element via JavaScript or HTML Attributes.

```html
<nve-alert status="success"></nve-alert>

<script type="module">
  const alert = document.querySelector('nve-alert');
  alert.status = 'warning';
</script>
```

<nve-alert>
  <nve-icon slot="icon">🎓</nve-icon> 
  <p nve-text="body">Learn: By default when a property is set Lit will not update the corresponding attribute in the DOM for performance. If the attribute is used as a style hook example, <code nve-text="code">:host([disabled])</code> then the <code nve-text="code">reflect</code> option can be set on the property decorator.</p>
</nve-alert>

## Impossible states

Properties/Attributes should avoid enabling “impossible states”. Impossible states are caused by conflicting APIs on a single element.

<nve-alert status="success">Do:</nve-alert>

```html
<nve-alert status="success">hello there</nve-alert>
```

<nve-alert status="danger">Don't:</nve-alert>

```html
<nve-alert info>hello there</nve-alert>
<nve-alert success>hello there</nve-alert>
<nve-alert warning>hello there</nve-alert>
<nve-alert danger>hello there</nve-alert>

<!-- alert cannot be in a success and error state -->
<nve-alert success danger>hello there</nve-alert>
```

<nve-alert><nve-icon slot="icon">🎓</nve-icon> Learn:&nbsp;<a href="https://kentcdodds.com/blog/make-impossible-states-impossible" nve-text="link">Make impossible states impossible</a></nve-alert>

## Boolean Types

Boolean property/attribute type behave the same as native HTML element boolean types. The presence of the attribute is truthy and absence of the attribute is falsy. ([MDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden))

```html
<nve-alert closable>hello there</nve-alert>
```

<nve-alert status="warning">
  Warning: avoid double negations on attributes as this breaks the default expectations of native HTML elements, examples (<code nve-text="code">disable-closable</code>, <code nve-text="code">not-closable</code>, <code nve-text="code">closable=”false”</code>)
</nve-alert>

<nve-alert status="warning">
  Warning: a custom coercion function is needed for react support which will set boolean attributes to a value of “false” <a href="https://github.com/vmware-clarity/core/blob/main/projects/core/src/internal/utils/dom.ts#L268" nve-text="link">example</a> <a href="https://github.com/facebook/react/issues/9230" nve-text="link">react issue</a>.
</nve-alert>

## Primitive Types

<nve-alert status="accent">Note: Primitive type guidance is for atomic and highly reusable element libraries</nve-alert>

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
Learn: <a href="https://developers.google.com/web/fundamentals/web-components/best-practices#attributes-properties" nve-text="link">Web Fundamentals Attributes vs Properties</a>
</nve-alert>

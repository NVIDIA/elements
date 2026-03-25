---
{
  title: 'Documentation Guidelines',
  layout: 'docs.11ty.js'
}
---

<style>
  .shortcode-demo {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: var(--nve-ref-space-sm);
    padding: var(--nve-ref-space-md);
    outline: var(--nve-ref-border-width-md) dashed var(--nve-ref-border-color-muted);
  }

  pre {
    display: block !important;
  }
</style>

# {{ title }}

API Guidelines for the [Eleventy](https://www.11ty.dev/) based documentation site for Elements. [Eleventy Shortcodes](https://www.11ty.dev/docs/shortcodes/) provide a way to create reusable templates in markdown content.

<br >

## Install Shortcode

Renders the install entrypoint of a given element API.

| Parameter | Description             | Type     |
| --------- | ----------------------- | -------- |
| Name      | Tag name of element API | `string` |

```html
{% raw %}
{% install 'nve-badge' %}
{% endraw %}
```

<div class="shortcode-demo">
{% install 'nve-badge' %}
</div>

## Example Shortcode

Renders an example template and its corresponding metadata.

| Parameter | Description                                            | Type                                                                               |
| --------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Path      | Fully qualified path to the examples file              | `string`                                                                           |
| Name      | Case sensitive name of the example to render from file | `string`                                                                           |
| Options   | Optional settings                                      | `{ "height": "150px", "align": "center", "summary": false, "layer": "highlight" }` |

### Example Default

<div nve-layout="grid gap:md span-items:6">

```html
{% raw %}
{% example '@nvidia-elements/core/button/button.examples.json' 'Default' %}
{% endraw %}
```

<div class="shortcode-demo">
{% example '@nvidia-elements/core/button/button.examples.json' 'Default' %}
</div>

</div>

### Example Options

<div nve-layout="grid gap:md span-items:6">

```html
{% raw %}
{% example '@nvidia-elements/core/button/button.examples.json' 'Default' '{ "height": "150px", "align": "center", "summary": false, "layer": "highlight" }' %}
{% endraw %}
```

<!-- vale Google.Quotes = NO -->
<div class="shortcode-demo">
{% example '@nvidia-elements/core/button/button.examples.json' 'Default' '{ "height": "150px", "align": "center", "summary": false, "layer": "highlight" }' %}
</div>
<!-- vale Google.Quotes = YES -->

</div>

## Example Tags Shortcode

Render the metadata tags of a given Example template.

| Parameter | Description                                            | Type     |
| --------- | ------------------------------------------------------ | -------- |
| Path      | Fully qualified path to the examples file              | `string` |
| Name      | Case sensitive name of the example to render from file | `string` |

<div nve-layout="grid gap:md span-items:6">

```html
{% raw %}
{% example-tags '@nvidia-elements/core/grid/grid.examples.json' 'PerformanceVirtualScroll' %}
{% endraw %}
```

<div class="shortcode-demo">
{% example-tags '@nvidia-elements/core/grid/grid.examples.json' 'PerformanceVirtualScroll' %}
</div>

</div>

## Example Group Shortcode

The `example-group` shortcode visualizes many related examples in a single layout. Each example renders its summary/description alongside its example.

| Parameter    | Description                                                     | Type     |
| ------------ | --------------------------------------------------------------- | -------- |
| Paths        | Fully qualified paths to the examples file and its example name | `string` |
| Content Slot | Extra context about related examples in example group           | `string` |

```html
{% raw %}
### Single or Group

{% example-group '@nvidia-elements/core/accordion/accordion.examples.json:Single' '@nvidia-elements/core/accordion/accordion.examples.json:Multiple' %}

Leverage accordions alone or in conjunction with others to create progressive disclosure patterns.

{% endexample-group %}
{% endraw %}
```

<div class="shortcode-demo">

### Single or Group

{% example-group '@nvidia-elements/core/accordion/accordion.examples.json:Single' '@nvidia-elements/core/accordion/accordion.examples.json:Multiple' %}

Leverage accordions alone or in conjunction with others to create progressive disclosure patterns.

{% endexample-group %}

</div>

## API Shortcode

Renders the description metadata of a given API. The identifier of the referenced API is optional. If you omit the identifier, the shortcode displays all API references of the provided type.

| Parameter  | Description              | Type                                                                             |
| ---------- | ------------------------ | -------------------------------------------------------------------------------- |
| Tag Name   | Tag name of element API  | `string`                                                                         |
| API        | API metadata to render   | `description` \| `event` \| `property` \| `slot` \| `css-property` \| `css-part` |
| Identifier | Optional public API name | `string`                                                                         |

### API Description

<div nve-layout="grid gap:md span-items:6">

```html
{% raw %}
{% api 'nve-button' 'description' %}
{% endraw %}
```

<div class="shortcode-demo">
{% api 'nve-button' 'description' %}
</div>

</div>

### API Event

<div nve-layout="grid gap:md span-items:6">

```html
{% raw %}
{% api 'nve-alert' 'event' 'close' %}
{% endraw %}
```

<div class="shortcode-demo">
{% api 'nve-alert' 'event' 'close' %}
</div>

</div>

### API Slot

<div nve-layout="grid gap:md span-items:6">

```html
{% raw %}
{% api 'nve-page' 'slot' 'header' %}
{% endraw %}
```

<div class="shortcode-demo">
{% api 'nve-page' 'slot' 'header' %}
</div>

</div>

### API CSS Part

<div nve-layout="grid gap:md span-items:6">

```html
{% raw %}
{% api 'nve-dialog' 'css-part' 'close-button' %}
{% endraw %}
```

<div class="shortcode-demo">
{% api 'nve-dialog' 'css-part' 'close-button' %}
</div>

</div>

### API CSS Property

<div nve-layout="grid gap:md span-items:6">

```html
{% raw %}
{% api 'nve-button' 'css-property' '--background' %}
{% endraw %}
```

<div class="shortcode-demo">
{% api 'nve-button' 'css-property' '--background' %}
</div>

</div>

### API Property / Attribute

<div nve-layout="grid gap:md span-items:6">

```html
{% raw %}
{% api 'nve-button' 'property' 'interaction' %}
{% endraw %}
```

<div class="shortcode-demo">
{% api 'nve-button' 'property' 'interaction' %}
</div>

</div>

### API Value

<div nve-layout="grid gap:md span-items:6">

```html
{% raw %}
{% api 'nve-button' 'property' 'interaction' 'destructive' %}
{% endraw %}
```

<div class="shortcode-demo">
{% api 'nve-button' 'property' 'interaction' 'destructive' %}
</div>

</div>

### API Type

If you omit the identifier, the shortcode displays all API references of the provided type.

<div nve-layout="column gap:md full">

```html
{% raw %}
{% api 'nve-avatar' 'property' %}
{% endraw %}
```

<div class="shortcode-demo">
{% api 'nve-avatar' 'property' %}
</div>

</div>

## Design Token Shortcode

Renders a given subset of matching design tokens.

| Parameter | Description              | Type     |
| --------- | ------------------------ | -------- |
| Name      | Tag name of token subset | `string` |

```html
{% raw %}
{% tokens 'ref-border-color' %}
{% endraw %}
```

{% tokens 'ref-border-color' %}

## Do/Don't Shortcode

Renders the "Do/Don't" shortcode layout for guidance on potential anti-patterns.

| Parameter | Description                     | Type     |
| --------- | ------------------------------- | -------- |
| Slot      | Slot for two example shortcodes | `string` |

```html
{% raw %}
{% dodont %}
{% example '@nvidia-elements/core/grid/grid.examples.json' 'ValidColumnCount' '{ "summary": false }' %}
{% example '@nvidia-elements/core/grid/grid.examples.json' 'InvalidColumnCount' '{ "summary": false }' %}
{% enddodont %}
{% endraw %}
```

<div class="shortcode-demo">
{% dodont %}
{% example '@nvidia-elements/core/grid/grid.examples.json' 'ValidColumnCount' '{ "summary": false }' %}
{% example '@nvidia-elements/core/grid/grid.examples.json' 'InvalidColumnCount' '{ "summary": false }' %}
{% enddodont %}
</div>

## Split Layout Shortcode

```html
{% raw %}
{% split %}
{% example '@nvidia-elements/core/button/button.examples.json' 'Pressed' %}
{% api 'nve-button' 'property' 'pressed' %}
{% endsplit %}
{% endraw %}
```

<div class="shortcode-demo">
{% split %}
{% example '@nvidia-elements/core/button/button.examples.json' 'Pressed' %}
{% api 'nve-button' 'property' 'pressed' %}
{% endsplit %}
</div>

```html
{% raw %}
{% split %}
{% example '@nvidia-elements/core/button/button.examples.json' 'Interaction' %}
{% api 'nve-button' 'property' 'interaction' %}
{% endsplit %}
{% endraw %}
```

<div class="shortcode-demo">
{% split %}
{% example '@nvidia-elements/core/button/button.examples.json' 'Interaction' %}
{% api 'nve-button' 'property' 'interaction' %}
{% endsplit %}
</div>

## Grouping Disjointed APIs

When comparing disjointed or non-enum based properties use the api value shortcode to explicitly render the api description for the given value.

```html
{% raw %}
### States
{% split %}
{% example '@nvidia-elements/core/button/button.examples.json' 'GroupStates' %}

| State    | Usage                                               |
| -------- | --------------------------------------------------- |
| selected | {% api 'nve-button' 'property' 'selected' 'true' %} |
| pressed  | {% api 'nve-button' 'property' 'pressed' 'true' %}  |
| disabled | {% api 'nve-button' 'property' 'disabled' 'true' %} |
{% endsplit %}
{% endraw %}
```

<div class="shortcode-demo">

### States

{% split %}
{% example '@nvidia-elements/core/button/button.examples.json' 'GroupStates' %}

| State    | Usage                                               |
| -------- | --------------------------------------------------- |
| selected | {% api 'nve-button' 'property' 'selected' 'true' %} |
| pressed  | {% api 'nve-button' 'property' 'pressed' 'true' %}  |
| disabled | {% api 'nve-button' 'property' 'disabled' 'true' %} |

{% endsplit %}

</div>

<!-- this is internally undocumented for now -->
<!--
## Example Doc Shortcode

The `example-doc` shortcode is similar to the `example` shortcode but will automatically render the best match documentation available for a given example. The shortcode will attempt automatically match/prioritize the most detailed content available first such as the component API, component description and example summary. This is an **opinionated** API due to the automatic selection of best choice example content. Compose other shortcodes for more fine-grained control of content.

| Parameter | Description                                            | Type     |
| --------- | ------------------------------------------------------ | -------- |
| Path      | Fully qualified path to the examples file              | `string` |
| Name      | Case sensitive name of the example to render from file | `string` |

```html
{% raw %}
{% example-doc '@nvidia-elements/core/dot/dot.examples.json' 'Size' %}
{% endraw %}
```

<div class="shortcode-demo">
{% example-doc '@nvidia-elements/core/dot/dot.examples.json' 'Size' %}
</div> -->

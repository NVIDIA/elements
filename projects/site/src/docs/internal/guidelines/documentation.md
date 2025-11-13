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
    padding: var(--nve-ref-space-sm);
    outline: var(--nve-ref-border-width-md) dashed var(--nve-ref-border-color-muted);
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

| Parameter | Description                                               | Type     |
| --------- | --------------------------------------------------------- | -------- |
| Path      | Fully qualified path to the examples file                 | `string` |
| Name      | Case sensitive name of the example to render from file    | `string` |
| Options   | Optional settings '{ "inline": false "height": "350px" }' | `object` |

```html
{% raw %}
{% example '@nvidia-elements/core/badge/badge.examples.json' 'Default' %}
{% endraw %}
```

<div class="shortcode-demo">
{% example '@nvidia-elements/core/badge/badge.examples.json' 'Default' %}
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
{% example-tags '@nvidia-elements/core/grid/grid.stories.json' 'PerformanceVirtualScroll' %}
{% endraw %}
```

<div class="shortcode-demo">
{% example-tags '@nvidia-elements/core/grid/grid.stories.json' 'PerformanceVirtualScroll' %}
</div>

</div>

## API Shortcode

Renders the description metadata of a given API. The identifier of the referenced API is optional. If no identifier is provided then all API references of provided type are displayed.

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

### API Type

If no identifier is provided then all API references of provided type are displayed.

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

## Do/Don't Shortcode

Renders the "Do/Don't" shortcode layout for guidance on potential anti-patterns.

| Parameter | Description                     | Type     |
| --------- | ------------------------------- | -------- |
| Slot      | Slot for two example shortcodes | `string` |

```html
{% raw %}
{% dodont %}
{% example '@nvidia-elements/core/grid/grid.stories.json' 'ValidColumnCount' %}
{% example '@nvidia-elements/core/grid/grid.stories.json' 'InvalidColumnCount' %}
{% enddodont %}
{% endraw %}
```

<div class="shortcode-demo">
{% dodont %}
{% example '@nvidia-elements/core/grid/grid.stories.json' 'ValidColumnCount' %}
{% example '@nvidia-elements/core/grid/grid.stories.json' 'InvalidColumnCount' %}
{% enddodont %}
</div>

## Split Layout Shortcode

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

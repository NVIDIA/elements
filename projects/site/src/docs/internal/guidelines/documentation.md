---
{
  title: 'Documentation Guidelines',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

API Guidelines for the [Eleventy](https://www.11ty.dev/) based documentation site for Elements. [Eleventy Shortcodes](https://www.11ty.dev/docs/shortcodes/) provide a way to create reusable templates in markdown content.

<br >

## Install Shortcode

Renders the install entrypoint of a given element API.

| Parameters | Description             | Type     |
| ---------- | ----------------------- | -------- |
| Name       | Tag name of element API | `string` |

```html
{% raw %}
{% install 'nve-badge' %}
{% endraw %}
```

## Example Shortcode

Renders an example template and its corresponding metadata.

| Parameters | Description                                            | Type     |
| ---------- | ------------------------------------------------------ | -------- |
| Path       | Fully qualified path to the examples file              | `string` |
| Name       | Case sensitive name of the example to render from file | `string` |
| Options    | JSON options '{ "inline": false, "height": "350px" }'  |

```html
{% raw %}
{% example '@nvidia-elements/core/badge/badge.examples.json', 'Default' %}
{% endraw %}
```

## Do/Don't Shortcode

Renders the "Do/Don't" shortcode layout for guidance on potential anti-patterns.

| Parameters | Description                     | Type     |
| ---------- | ------------------------------- | -------- |
| Slot       | Slot for two example shortcodes | `string` |

```html
{% raw %}
{% dodont %}
{% example '@nvidia-elements/core/grid/grid.stories.json', 'ValidColumnCount' %}
{% example '@nvidia-elements/core/grid/grid.stories.json', 'InvalidColumnCount' %}
{% enddodont %}
{% endraw %}
```

## API Shortcode

Renders the description metadata of a given API. The identifier of the referenced API is optional. If no identifier is provided then all API references of provided type are displayed.

| Parameters | Description              | Type                                                                             |
| ---------- | ------------------------ | -------------------------------------------------------------------------------- |
| Tag Name   | Tag name of element API  | `string`                                                                         |
| API        | API metadata to render   | `description` \| `event` \| `property` \| `slot` \| `css-property` \| `css-part` |
| Identifier | Optional public API name | `string`                                                                         |

<div nve-layout="grid gap:md span-items:6">

```html
{% raw %}
{% api 'nve-button' 'description' %}
{% endraw %}
```

{% api 'nve-button' 'description' %}

</div>

---

<div nve-layout="grid gap:md span-items:6">

```html
{% raw %}
{% api 'nve-alert' 'event' 'close' %}
{% endraw %}
```

{% api 'nve-alert' 'event' 'close' %}

</div>

---

<div nve-layout="grid gap:md span-items:6">

```html
{% raw %}
{% api 'nve-page' 'slot' 'header' %}
{% endraw %}
```

{% api 'nve-page' 'slot' 'header' %}

</div>

---

<div nve-layout="grid gap:md span-items:6">

```html
{% raw %}
{% api 'nve-dialog' 'css-part' 'close-button' %}
{% endraw %}
```

{% api 'nve-dialog' 'css-part' 'close-button' %}

</div>

---

<div nve-layout="grid gap:md span-items:6">

```html
{% raw %}
{% api 'nve-button' 'css-property' '--background' %}
{% endraw %}
```

{% api 'nve-button' 'css-property' '--background' %}

</div>

---

<div nve-layout="grid gap:md span-items:6">

```html
{% raw %}
{% api 'nve-button' 'property' 'interaction' %}
{% endraw %}
```

{% api 'nve-button' 'property' 'interaction' %}

</div>

---

If no identifier is provided then all API references of provided type are displayed.

<div nve-layout="column gap:md full">

```html
{% raw %}
{% api 'nve-avatar' 'property' %}
{% endraw %}
```

{% api 'nve-avatar' 'property' %}

</div>

## Layout Examples

```html
{% raw %}
## Interaction
{% split %}
{% example '@nvidia-elements/core/button/button.examples.json' 'Interaction' %}
{% api 'nve-button' 'property' 'interaction' %}
{% endsplit %}
{% endraw %}
```

### Interaction

{% split %}
{% example '@nvidia-elements/core/button/button.examples.json' 'Interaction' %}
{% api 'nve-button' 'property' 'interaction' %}
{% endsplit %}

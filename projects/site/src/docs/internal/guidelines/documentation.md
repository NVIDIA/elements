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

```html
{% raw %}
{% install 'nve-badge' %}
{% endraw %}
```

| Parameters | Description             | Type     |
| ---------- | ----------------------- | -------- |
| Name       | Tag name of element API | `string` |

## Example Shortcode

Renders an example template and its corresponding metadata.

```html
{% raw %}
{% example '@nvidia-elements/core/badge/badge.examples.json', 'Default' %}
{% endraw %}
```

| Parameters | Description                                            | Type     |
| ---------- | ------------------------------------------------------ | -------- |
| Path       | Fully qualified path to the examples file              | `string` |
| Name       | Case sensitive name of the example to render from file | `string` |

## API Shortcode

Renders the description metadata of a given API.

```html
{% raw %}
{% api 'nve-alert', 'property', 'status' %}
{% endraw %}
```

| Parameters | Description             | Type                                             |
| ---------- | ----------------------- | ------------------------------------------------ |
| Tag Name   | Tag name of element API | `string`                                         |
| API        | API metadata to render  | `description` \| `event` \| `property` \| `slot` |
| Identifier | Public API name         |

## Do/Don't Shortcode

Renders the "Do/Don't" shortcode layout for guidance on potential anti-patterns.

```html
{% raw %}
{% dodont %}
{% example '@nvidia-elements/core/grid/grid.stories.json', 'ValidColumnCount' %}
{% example '@nvidia-elements/core/grid/grid.stories.json', 'InvalidColumnCount' %}
{% enddodont %}
{% endraw %}
```

| Parameters | Description                     | Type     |
| ---------- | ------------------------------- | -------- |
| Slot       | Slot for two example shortcodes | `string` |

---
{
  title: 'Interactions',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

The interaction tokens `--nve-sys-interaction-*` provide semantic interaction states for interactive components. These styles include the following categories:

- `default`
- `ephasize`
- `destructive`
- `flat`

All UI interactions contain a default set of six interactive states.

- `default`
- `hover`
- `active`
- `selected`
- `disabled`
- `focused`

Below are HTML & CSS demonstrating how to consume the interaction design tokens.
Demos will be replaced with custom elements over time.

## Interactions

The `--nve-sys-interaction-state-ratio-*` provides a step ratio value for each interaction state. This combined with the CSS [color-mix](https://developer.chrome.com/blog/css-color-mix/) property allows colors to be dynamically computed from the base color.

{% story '@nvidia-elements/themes/theme.stories.json', 'ButtonInteractions' %}

```css
button {
  background: color-mix(in oklab, var(--nve-sys-interaction-state-base) 100%, var(--nve-sys-interaction-state-mix) var(--nve-sys-interaction-state-ratio, 0%));
}

button:hover {
  --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-hover);
}

button:active {
  --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-active);
}

button:disabled {
  --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-disabled);
}

button[selected] {
  --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-selected);
}
```

## Interactions

{% story '@nvidia-elements/themes/theme.stories.json', 'Interactions' %}

## Tokens

{% tokens 'sys-interaction-background', 'sys-interaction-color' %}

### Emphasis

{% tokens 'sys-interaction-emphasis' %}

### Destructive

{% tokens 'sys-interaction-destructive' %}

### Highlighted

{% tokens 'sys-interaction-highlighted' %}

### Selected

{% tokens 'sys-interaction-selected' %}

### Disabled

{% tokens 'sys-interaction-disabled' %}

### Field

{% tokens 'sys-interaction-field' %}

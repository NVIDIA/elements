---
{
  title: 'Custom Themes',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Custom themes can be created by overriding the global CSS properties.

```css
:root {
  --nve-sys-support-success-emphasis-color: var(--nve-ref-color-brand-green-1000);
}
```

When creating a custom theme the theme should apply ONE of the following configuration flags.
These flags help the system determine which types of themes are available for the user to set or apply.

```css
:root {
  --nve-config-color-scheme-light: true;
  --nve-config-color-scheme-dark: true;
  --nve-config-color-scheme-high-contrast: true;
  --nve-config-scale-compact: true;
  --nve-config-reduced-motion: true;
}
```

## Theme Generator

The demo below demonstrates how only a few tokens adjusted can drastically change the look and feel of the system.

<theme-generator-demo></theme-generator-demo>

<script type="module" src="/_internal/stories/theme/theme-generator.js"></script>

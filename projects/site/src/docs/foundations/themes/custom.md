---
{
  title: 'Custom Themes',
  description: 'Build a custom theme on top of NVIDIA Elements: override design tokens, layer your own values, and produce a complete theme bundle.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

You can create custom themes by overriding the global CSS properties.

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

## Classic Theme

The classic theme stylesheet is a starting point for product-specific themes. View the [source CSS](/static/themes/classic.css).

<nve-codeblock id="classic-theme-source" language="css" style="block-size: 400px"></nve-codeblock>

<script type="module">
  import '@nvidia-elements/code/codeblock/languages/css.js';
  import '@nvidia-elements/code/codeblock/define.js';

  const codeblock = document.querySelector('#classic-theme-source');
  try {
    const response = await fetch(new URL('static/themes/classic.css', document.baseURI));
    if (response.ok) {
      codeblock.code = await response.text();
    } else {
      console.warn('Could not load classic theme source:', response.status);
    }
  } catch (error) {
    console.warn('Could not load classic theme source:', error);
  }
</script>

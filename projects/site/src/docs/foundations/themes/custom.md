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

When creating a custom theme the theme should apply ONE of the following configuration flags. These flags help the system determine which types of themes are available for the user to set or apply.

```css
:root {
  --nve-config-color-scheme-light: true;
  --nve-config-color-scheme-dark: true;
  --nve-config-color-scheme-high-contrast: true;
  --nve-config-scale-compact: true;
  --nve-config-reduced-motion: true;
}
```

## Classic Theme

The classic theme stylesheet is a starting point for product-specific themes. View the [source CSS](/static/themes/classic.css).

<nve-switch>
  <label>Classic</label>
  <input id="classic-theme-toggle" type="checkbox" value="classic" />
</nve-switch>

<nve-codeblock id="classic-theme-source" language="css" style="block-size: 400px">
  <nve-copy-button id="classic-theme-copy" slot="actions" aria-label="Copy classic theme CSS" behavior-copy container="flat" disabled></nve-copy-button>
</nve-codeblock>

<script type="module">
  import '@nvidia-elements/code/codeblock/languages/css.js';
  import '@nvidia-elements/code/codeblock/define.js';
  import '@nvidia-elements/core/copy-button/define.js';
  import '@nvidia-elements/core/switch/define.js';

  const codeblock = document.querySelector('#classic-theme-source');
  const copyButton = document.querySelector('#classic-theme-copy');
  const toggle = document.querySelector('#classic-theme-toggle');
  const root = document.documentElement;
  const stylesheetUrl = new URL('static/themes/classic.css', document.baseURI);
  const getThemes = () => (root.getAttribute('nve-theme') ?? '').split(/\s+/).filter(Boolean);
  const syncToggle = () => {
    const themes = getThemes();
    toggle.checked = themes.includes('classic') || themes.includes('classic-dark');
    toggle.disabled = themes.includes('high-contrast');
  };

  syncToggle();
  new MutationObserver(syncToggle).observe(root, { attributes: true, attributeFilter: ['nve-theme'] });

  toggle.addEventListener('change', () => {
    const themes = getThemes().filter(theme => theme !== 'classic' && theme !== 'classic-dark');
    const enabled = toggle.checked && !themes.includes('high-contrast');
    const stylesheet = document.querySelector('#classic-theme-stylesheet');

    if (enabled) {
      if (!stylesheet) {
        const link = document.createElement('link');
        link.id = 'classic-theme-stylesheet';
        link.rel = 'stylesheet';
        link.href = stylesheetUrl.href;
        document.head.append(link);
      }
      themes.push(themes.includes('dark') ? 'classic-dark' : 'classic');
    } else {
      stylesheet?.remove();
    }

    root.setAttribute('nve-theme', themes.join(' '));
    document.dispatchEvent(new CustomEvent('nve-theme-change', { detail: { theme: themes.join(' ') } }));
  });

  try {
    const response = await fetch(stylesheetUrl);
    if (response.ok) {
      const source = await response.text();
      codeblock.code = source;
      copyButton.value = source;
      copyButton.disabled = false;
    } else {
      console.warn('Could not load classic theme source:', response.status);
    }
  } catch (error) {
    console.warn('Could not load classic theme source:', error);
  }
</script>

## Theme Generator

The demo below demonstrates how only a few tokens adjusted can drastically change the look and feel of the system.

<theme-generator-demo></theme-generator-demo>

<script type="module" src="/_internal/stories/theme/theme-generator.js"></script>

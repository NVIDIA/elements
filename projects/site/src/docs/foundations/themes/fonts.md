---
{
  title: 'Fonts',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

By default themes provide a default font family globally. For Elements default `light` and `dark` theme this is `Inter`. For our experimenal `brand` and `brand-dark` theme it defaults to `NVIDIA Sans`. Font styles can be overriden for a given theme by loading the appropriate font stylesheet and setting the font theme value.

```css
/* import the global CSS into your project (import may vary based on build tools) */
@import '@nvidia-elements/themes/dist/fonts/inter.css';
@import '@nvidia-elements/themes/dist/fonts/nvidia-sans.css';
```

```html
<!-- use elements default dark theme but with nvidia-sans -->
<html lang="en" nve-theme="dark nvidia-sans">

<!-- use brand dark theme but with inter -->
<html lang="en" nve-theme="brand-dark inter">
```

## Tokens

{% tokens 'ref-font-family', 'ref-font-weight', 'ref-font-size', 'ref-font-line-height', 'sys-text' %}

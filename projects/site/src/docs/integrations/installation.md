---
{
  title: 'Installation',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% integration %}

{% installation %}

Elements ships as many small packages. This allows you to choose what
tools your application needs and omit anything unnecessary, improving
application performance.

```css
/* base theme */
@import '@nvidia-elements/themes/fonts/inter.css';
@import '@nvidia-elements/themes/index.css';

/* optional themes */
@import '@nvidia-elements/themes/high-contrast.css';
@import '@nvidia-elements/themes/reduced-motion.css';
@import '@nvidia-elements/themes/compact.css';
@import '@nvidia-elements/themes/dark.css';
@import '@nvidia-elements/themes/debug.css';

/* optional CSS utilities */
@import '@nvidia-elements/styles/typography.css';
@import '@nvidia-elements/styles/layout.css';
@import '@nvidia-elements/styles/view-transitions.css';
```

```typescript
// Load via typescript imports to make available in HTML templates
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/dot/define.js';
...
```

```html
<!-- set global theme -->
<html nve-theme="dark" nve-transition="auto">
```

```html
<!-- use component in HTML template -->
<nve-button>hello there</nve-button>
```

## Registry Usage Guidelines

{% artifactory-usage %}
